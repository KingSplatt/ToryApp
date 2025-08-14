using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ItemsController> _logger;

        public ItemsController(ApplicationDbContext context, ILogger<ItemsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/items
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems(
            [FromQuery] int? inventoryId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Items.AsQueryable();

            if (inventoryId.HasValue)
            {
                query = query.Where(i => i.InventoryId == inventoryId.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(i => i.CreateAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new ItemDto
                {
                    Id = i.Id,
                    CustomId = i.CustomId,
                    InventoryId = i.InventoryId,
                    Name = i.Name,
                    CreateAt = i.CreateAt
                })
                .ToListAsync();

            return Ok(new
            {
                items,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // GET: api/items/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ItemDto>> GetItem(int id)
        {
            var item = await _context.Items.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            var itemDto = new ItemDto
            {
                Id = item.Id,
                CustomId = item.CustomId,
                InventoryId = item.InventoryId,
                Name = item.Name,
                CreateAt = item.CreateAt
            };

            return Ok(itemDto);
        }

        // POST: api/items
        [HttpPost]
        public async Task<ActionResult<ItemDto>> CreateItem(CreateItemDto createItemDto)
        {
            var item = new Item
            {
                CustomId = createItemDto.CustomId,
                InventoryId = createItemDto.InventoryId,
                Name = createItemDto.Name,
                CreateAt = DateTime.Now
            };

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            var itemDto = new ItemDto
            {
                Id = item.Id,
                CustomId = item.CustomId,
                InventoryId = item.InventoryId,
                Name = item.Name,
                CreateAt = item.CreateAt
            };

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, itemDto);
        }

        // PUT: api/items/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, UpdateItemDto updateItemDto)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.CustomId = updateItemDto.CustomId;
            item.Name = updateItemDto.Name;
            // Note: Not updating InventoryId or CreateAt

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/items/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/items/inventories
        [HttpGet("inventories")]
        public async Task<ActionResult<IEnumerable<InventoryStatsDto>>> GetInventoryStats()
        {
            var stats = await _context.Items
                .GroupBy(i => i.InventoryId)
                .Select(g => new InventoryStatsDto
                {
                    InventoryId = g.Key,
                    ItemCount = g.Count(),
                    LatestItemDate = g.Max(i => i.CreateAt)
                })
                .OrderByDescending(s => s.ItemCount)
                .ToListAsync();

            return Ok(stats);
        }

        private bool ItemExists(int id)
        {
            return _context.Items.Any(e => e.Id == id);
        }
    }

    // DTOs
    public class ItemDto
    {
        public int Id { get; set; }
        public string? CustomId { get; set; }
        public int InventoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; }
    }

    public class CreateItemDto
    {
        public string? CustomId { get; set; }
        public int InventoryId { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateItemDto
    {
        public string? CustomId { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class InventoryStatsDto
    {
        public int InventoryId { get; set; }
        public int ItemCount { get; set; }
        public DateTime LatestItemDate { get; set; }
    }
}
