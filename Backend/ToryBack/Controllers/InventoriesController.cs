using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<InventoriesController> _logger;

        public InventoriesController(ApplicationDbContext context, ILogger<InventoriesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryDto>>> GetInventories(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? category = null,
            [FromQuery] string? search = null,
            [FromQuery] string? sort = "recent")
        {
            var query = _context.Inventories
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.InventoryTags)
                    .ThenInclude(it => it.Tag)
                .AsQueryable();

            // Filter by public inventories only for now (add auth later)
            query = query.Where(i => i.IsPublic);

            // Category filter
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(i => i.Category.Name.ToLower() == category.ToLower());
            }

            // Search filter
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(i => 
                    i.Title.Contains(search) || 
                    i.Description.Contains(search) ||
                    i.InventoryTags.Any(it => it.Tag.Name.Contains(search)));
            }

            // Sorting
            query = sort?.ToLower() switch
            {
                "popular" => query.OrderByDescending(i => i.Items.Count()),
                "name" => query.OrderBy(i => i.Title),
                "items" => query.OrderByDescending(i => i.Items.Count()),
                _ => query.OrderByDescending(i => i.CreatedAt) // "recent" default
            };

            var totalCount = await query.CountAsync();
            var inventories = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new InventoryDto
                {
                    Id = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    Category = i.Category.Name,
                    ItemCount = i.Items.Count(),
                    IsPublic = i.IsPublic,
                    Owner = i.Owner.FullName,
                    LastUpdated = i.UpdatedAt,
                    Tags = i.InventoryTags.Select(it => it.Tag.Name).ToList(),
                    ImageUrl = i.ImageUrl
                })
                .ToListAsync();

            return Ok(new
            {
                items = inventories,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryDetailDto>> GetInventory(int id)
        {
            var inventory = await _context.Inventories
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.InventoryTags)
                    .ThenInclude(it => it.Tag)
                .Include(i => i.Items)
                .Include(i => i.CustomFields)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventory == null)
                return NotFound();

            // Check if user has access (public or owned by user - add auth later)
            if (!inventory.IsPublic)
            {
                // TODO: Check if user has access
                return Forbid();
            }

            var result = new InventoryDetailDto
            {
                Id = inventory.Id,
                Title = inventory.Title,
                Description = inventory.Description,
                Category = inventory.Category.Name,
                ItemCount = inventory.Items.Count,
                IsPublic = inventory.IsPublic,
                Owner = inventory.Owner.FullName,
                CreatedAt = inventory.CreatedAt,
                LastUpdated = inventory.UpdatedAt,
                Tags = inventory.InventoryTags.Select(it => it.Tag.Name).ToList(),
                ImageUrl = inventory.ImageUrl,
                CustomFields = inventory.CustomFields.Select(cf => new CustomFieldDto
                {
                    Id = cf.Id,
                    Name = cf.Name,
                    Type = cf.Type.ToString(),
                    ShowInTable = cf.ShowInTable
                }).ToList()
            };

            return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("tags")]
        public async Task<ActionResult<IEnumerable<TagDto>>> GetPopularTags([FromQuery] int limit = 20)
        {
            var tags = await _context.Tags
                .OrderByDescending(t => t.UsageCount)
                .Take(limit)
                .Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    UsageCount = t.UsageCount
                })
                .ToListAsync();

            return Ok(tags);
        }
        //pendiente
        [HttpPost]
        public async Task<ActionResult<InventoryDto>> CreateInventory(InventoryDto inventoryDto)
        {
            var inventory = new Inventory
            {
                Title = inventoryDto.Title,
                Description = inventoryDto.Description,
                CategoryId = inventoryDto.CategoryId,
                IsPublic = inventoryDto.IsPublic,
                OwnerId = inventoryDto.OwnerId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            inventoryDto.Id = inventory.Id;
            return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, inventoryDto);
        }
    }

    // DTOs
    public class InventoryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public bool IsPublic { get; set; }
        public string Owner { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public DateTime LastUpdated { get; set; }
        public List<string> Tags { get; set; } = new();
        public string? ImageUrl { get; set; }
    }

    public class InventoryDetailDto : InventoryDto
    {
        public DateTime CreatedAt { get; set; }
        public List<CustomFieldDto> CustomFields { get; set; } = new();
    }

    public class CustomFieldDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool ShowInTable { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int UsageCount { get; set; }
    }
}
