using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;
using Microsoft.AspNetCore.Identity;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<InventoriesController> _logger;
        private readonly UserManager<User> _userManager;

        public InventoriesController(ApplicationDbContext context, ILogger<InventoriesController> logger, UserManager<User> userManager)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryDetailDto>>> GetInventories()
        {
            var inventories = await _context.Inventories
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.InventoryTags)
                    .ThenInclude(it => it.Tag)
                .Include(i => i.Items)
                .Include(i => i.CustomFields)
                .Where(i => !i.IsPublic || i.IsPublic)
                .OrderByDescending(i => i.UpdatedAt)
                .Select(i => new InventoryDetailDto
                {
                    Id = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    Category = i.Category.Name,
                    ItemCount = i.Items.Count,
                    IsPublic = i.IsPublic,
                    Owner = i.Owner.FullName,
                    OwnerId = i.OwnerId,
                    CreatedAt = i.CreatedAt,
                    LastUpdated = i.UpdatedAt,
                    Tags = i.InventoryTags.Select(it => it.Tag.Name).ToList(),
                    ImageUrl = i.ImageUrl,
                    CustomFields = i.CustomFields.Select(cf => new CustomFieldDto
                    {
                        Id = cf.Id,
                        Name = cf.Name,
                        Type = cf.Type.ToString(),
                        ShowInTable = cf.ShowInTable
                    }).ToList()
                })
                .ToListAsync();

            return Ok(inventories);

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
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<InventoryDetailDto>>> GetUserInventories(string userId)
        {
            var inventories = await _context.Inventories
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.InventoryTags)
                    .ThenInclude(it => it.Tag)
                .Include(i => i.Items)
                .Include(i => i.CustomFields)
                .Where(i => i.OwnerId == userId && (i.IsPublic || !i.IsPublic))
                .OrderByDescending(i => i.UpdatedAt)
                .Select(i => new InventoryDetailDto
                {
                    Id = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    Category = i.Category.Name,
                    ItemCount = i.Items.Count,
                    IsPublic = i.IsPublic,
                    Owner = i.Owner.FullName,
                    OwnerId = i.OwnerId,
                    CreatedAt = i.CreatedAt,
                    LastUpdated = i.UpdatedAt,
                    Tags = i.InventoryTags.Select(it => it.Tag.Name).ToList(),
                    ImageUrl = i.ImageUrl,
                    CustomFields = i.CustomFields.Select(cf => new CustomFieldDto
                    {
                        Id = cf.Id,
                        Name = cf.Name,
                        Type = cf.Type.ToString(),
                        ShowInTable = cf.ShowInTable
                    }).ToList()
                })
                .ToListAsync();

            return Ok(inventories);
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
        public async Task<ActionResult<InventoryDto>> CreateInventory(CreateInventoryDto createDto)
        {
            try
            {
                _logger.LogInformation("Creating inventory with data: {@CreateDto}", createDto);
                string? currentUserId = null;

                if (User.Identity?.IsAuthenticated == true)
                {
                    var currentUser = await _userManager.FindByNameAsync(User.Identity.Name!);
                    if (currentUser != null)
                    {
                        currentUserId = currentUser.Id;
                        _logger.LogInformation("Authenticated user found: {UserId}", currentUserId);
                    }
                    else
                    {
                        _logger.LogInformation("Creating OAuth user for: {UserName}", User.Identity.Name);
                        var newUser = new User
                        {
                            UserName = User.Identity.Name,
                            Email = User.Identity.Name,
                            FullName = User.FindFirst("name")?.Value ?? User.Identity.Name ?? "Unknown User",
                            IsOAuthUser = true,
                            RegistrationTime = DateTime.UtcNow,
                            ProfilePictureUrl = User.FindFirst("picture")?.Value
                        };
                        var createResult = await _userManager.CreateAsync(newUser);
                        if (createResult.Succeeded)
                        {
                            currentUserId = newUser.Id;
                            _logger.LogInformation("OAuth user created successfully: {UserId}", currentUserId);
                        }
                        else
                        {
                            _logger.LogError("Failed to create OAuth user: {Errors}", string.Join(", ", createResult.Errors.Select(e => e.Description)));
                            return BadRequest("Failed to create user account");
                        }
                    }
                }
                else
                {
                    currentUserId = createDto.OwnerId;
                    _logger.LogWarning("User not authenticated, using provided OwnerId: {OwnerId}", currentUserId);
                    var userExists = await _context.Users.AnyAsync(u => u.Id == currentUserId);
                    if (!userExists)
                    {
                        _logger.LogWarning("User not found: {OwnerId}", currentUserId);
                        return BadRequest($"User not found: {currentUserId}");
                    }
                }

                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest("Unable to determine user identity");
                }
                var categoryNameMapping = new Dictionary<string, string>
                {
                    ["electronic"] = "Electronics",
                    ["tools"] = "Tools",
                    ["books"] = "Books",
                    ["home"] = "Home",
                    ["collectibles"] = "Collectibles",
                    ["office"] = "Office",
                    ["sports"] = "Sports",
                    ["music"] = "Music",
                    ["art"] = "Art",
                    ["others"] = "Other"
                };
                var mappedCategoryName = categoryNameMapping.GetValueOrDefault(createDto.CategoryName.ToLower(), createDto.CategoryName);
                var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == mappedCategoryName);
                if (category == null)
                {
                    _logger.LogWarning("Category not found: {CategoryName}", createDto.CategoryName);
                    return BadRequest($"Invalid category: {createDto.CategoryName}");
                }
                var inventory = new Inventory
                {
                    Title = createDto.Title,
                    Description = createDto.Description ?? string.Empty,
                    CategoryId = category.Id,
                    IsPublic = createDto.IsPublic,
                    OwnerId = currentUserId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Inventories.Add(inventory);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Inventory created with ID: {InventoryId}", inventory.Id);
                // Handle tags
                if (createDto.Tags != null && createDto.Tags.Any())
                {
                    var tagsToProcess = new List<Tag>();
                    foreach (var tagName in createDto.Tags)
                    {
                        var trimmedTagName = tagName.Trim();
                        if (string.IsNullOrEmpty(trimmedTagName)) continue;
                        var normalizedTagName = trimmedTagName.ToLower();
                        // Find or create tag
                        var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name.ToLower() == normalizedTagName);
                        if (tag == null)
                        {
                            tag = new Tag
                            {
                                Name = trimmedTagName,
                                UsageCount = 1,
                                CreatedAt = DateTime.UtcNow
                            };
                            _context.Tags.Add(tag);
                        }
                        else
                        {
                            tag.UsageCount++;
                        }
                        tagsToProcess.Add(tag);
                    }
                    await _context.SaveChangesAsync();
                    foreach (var tag in tagsToProcess)
                    {
                        var inventoryTag = new InventoryTag
                        {
                            InventoryId = inventory.Id,
                            TagId = tag.Id,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.InventoryTags.Add(inventoryTag);
                    }
                }
                // Handle custom fields
                if (createDto.CustomFields != null && createDto.CustomFields.Any())
                {
                    foreach (var customFieldDto in createDto.CustomFields)
                    {
                        var customField = new CustomField
                        {
                            InventoryId = inventory.Id,
                            Name = customFieldDto.Name,
                            Type = Enum.Parse<FieldType>(customFieldDto.Type, true),
                            ShowInTable = customFieldDto.ShowInTable,
                            SortOrder = customFieldDto.SortOrder,
                            ValidationRules = customFieldDto.ValidationRules,
                            Options = customFieldDto.Options,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.CustomFields.Add(customField);
                    }
                }
                await _context.SaveChangesAsync();
                // Return created inventory
                var result = new InventoryDto
                {
                    Id = inventory.Id,
                    Title = inventory.Title,
                    Description = inventory.Description,
                    Category = category.Name,
                    CategoryId = category.Id.ToString(),
                    ItemCount = 0,
                    IsPublic = inventory.IsPublic,
                    Owner = "Current User", // TODO: Get from auth
                    OwnerId = inventory.OwnerId,
                    LastUpdated = inventory.UpdatedAt,
                    Tags = createDto.Tags ?? new List<string>(),
                    ImageUrl = inventory.ImageUrl
                };

                return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inventory");
                return StatusCode(500, "Internal server error");
            }
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
        public String OwnerId { get; set; } = string.Empty;
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

    public class CreateInventoryDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public string OwnerId { get; set; } = string.Empty;
        public List<string>? Tags { get; set; }
        public List<CreateCustomFieldDto>? CustomFields { get; set; }
    }

    public class CreateCustomFieldDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool ShowInTable { get; set; }
        public int SortOrder { get; set; }
        public string? ValidationRules { get; set; }
        public string? Options { get; set; }
    }
}
