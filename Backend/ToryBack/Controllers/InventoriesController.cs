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
                .Where(i => !i.IsPublic || i.IsPublic)
                .OrderByDescending(i => i.UpdatedAt)
                .ToListAsync();

            var result = inventories.Select(i => new InventoryDetailDto
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
                CustomFields = GetInventoryCustomFields(i)
            }).ToList();

            return Ok(result);
        }

        // Helper method to convert inventory fixed fields to CustomFieldDto list
        private static List<CustomFieldDto> GetInventoryCustomFields(Inventory inventory)
        {
            var customFields = new List<CustomFieldDto>();
            
            // String fields
            if (inventory.CustomString1State && !string.IsNullOrEmpty(inventory.CustomString1Name))
                customFields.Add(new CustomFieldDto { Id = 1, Name = inventory.CustomString1Name, Type = "Text", ShowInTable = false });
            if (inventory.CustomString2State && !string.IsNullOrEmpty(inventory.CustomString2Name))
                customFields.Add(new CustomFieldDto { Id = 2, Name = inventory.CustomString2Name, Type = "Text", ShowInTable = false });
            if (inventory.CustomString3State && !string.IsNullOrEmpty(inventory.CustomString3Name))
                customFields.Add(new CustomFieldDto { Id = 3, Name = inventory.CustomString3Name, Type = "Text", ShowInTable = false });
                
            // Integer fields
            if (inventory.CustomInt1State && !string.IsNullOrEmpty(inventory.CustomInt1Name))
                customFields.Add(new CustomFieldDto { Id = 4, Name = inventory.CustomInt1Name, Type = "Number", ShowInTable = false });
            if (inventory.CustomInt2State && !string.IsNullOrEmpty(inventory.CustomInt2Name))
                customFields.Add(new CustomFieldDto { Id = 5, Name = inventory.CustomInt2Name, Type = "Number", ShowInTable = false });
            if (inventory.CustomInt3State && !string.IsNullOrEmpty(inventory.CustomInt3Name))
                customFields.Add(new CustomFieldDto { Id = 6, Name = inventory.CustomInt3Name, Type = "Number", ShowInTable = false });
                
            // Boolean fields
            if (inventory.CustomBool1State && !string.IsNullOrEmpty(inventory.CustomBool1Name))
                customFields.Add(new CustomFieldDto { Id = 7, Name = inventory.CustomBool1Name, Type = "Checkbox", ShowInTable = false });
            if (inventory.CustomBool2State && !string.IsNullOrEmpty(inventory.CustomBool2Name))
                customFields.Add(new CustomFieldDto { Id = 8, Name = inventory.CustomBool2Name, Type = "Checkbox", ShowInTable = false });
            if (inventory.CustomBool3State && !string.IsNullOrEmpty(inventory.CustomBool3Name))
                customFields.Add(new CustomFieldDto { Id = 9, Name = inventory.CustomBool3Name, Type = "Checkbox", ShowInTable = false });
                
            // Date fields
            if (inventory.CustomDate1State && !string.IsNullOrEmpty(inventory.CustomDate1Name))
                customFields.Add(new CustomFieldDto { Id = 10, Name = inventory.CustomDate1Name, Type = "Date", ShowInTable = false });
            if (inventory.CustomDate2State && !string.IsNullOrEmpty(inventory.CustomDate2Name))
                customFields.Add(new CustomFieldDto { Id = 11, Name = inventory.CustomDate2Name, Type = "Date", ShowInTable = false });
            if (inventory.CustomDate3State && !string.IsNullOrEmpty(inventory.CustomDate3Name))
                customFields.Add(new CustomFieldDto { Id = 12, Name = inventory.CustomDate3Name, Type = "Date", ShowInTable = false });
                
            // Decimal fields
            if (inventory.CustomDecimal1State && !string.IsNullOrEmpty(inventory.CustomDecimal1Name))
                customFields.Add(new CustomFieldDto { Id = 13, Name = inventory.CustomDecimal1Name, Type = "Decimal", ShowInTable = false });
            if (inventory.CustomDecimal2State && !string.IsNullOrEmpty(inventory.CustomDecimal2Name))
                customFields.Add(new CustomFieldDto { Id = 14, Name = inventory.CustomDecimal2Name, Type = "Decimal", ShowInTable = false });
            if (inventory.CustomDecimal3State && !string.IsNullOrEmpty(inventory.CustomDecimal3Name))
                customFields.Add(new CustomFieldDto { Id = 15, Name = inventory.CustomDecimal3Name, Type = "Decimal", ShowInTable = false });
                
            return customFields;
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
                CustomFields = GetInventoryCustomFields(inventory)
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
                .Where(i => i.OwnerId == userId && (i.IsPublic || !i.IsPublic))
                .OrderByDescending(i => i.UpdatedAt)
                .ToListAsync();

            var result = inventories.Select(i => new InventoryDetailDto
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
                CustomFields = GetInventoryCustomFields(i)
            }).ToList();

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
                // Handle custom fields (new fixed field approach)
                if (createDto.CustomFields != null && createDto.CustomFields.Any())
                {
                    int stringFieldIndex = 1;
                    int intFieldIndex = 1;
                    int boolFieldIndex = 1;
                    int dateFieldIndex = 1;
                    int decimalFieldIndex = 1;

                    foreach (var customFieldDto in createDto.CustomFields)
                    {
                        switch (customFieldDto.Type.ToLower())
                        {
                            case "text":
                            case "string":
                                if (stringFieldIndex == 1)
                                {
                                    inventory.CustomString1State = true;
                                    inventory.CustomString1Name = customFieldDto.Name;
                                }
                                else if (stringFieldIndex == 2)
                                {
                                    inventory.CustomString2State = true;
                                    inventory.CustomString2Name = customFieldDto.Name;
                                }
                                else if (stringFieldIndex == 3)
                                {
                                    inventory.CustomString3State = true;
                                    inventory.CustomString3Name = customFieldDto.Name;
                                }
                                stringFieldIndex++;
                                break;
                                
                            case "number":
                            case "int":
                            case "integer":
                                if (intFieldIndex == 1)
                                {
                                    inventory.CustomInt1State = true;
                                    inventory.CustomInt1Name = customFieldDto.Name;
                                }
                                else if (intFieldIndex == 2)
                                {
                                    inventory.CustomInt2State = true;
                                    inventory.CustomInt2Name = customFieldDto.Name;
                                }
                                else if (intFieldIndex == 3)
                                {
                                    inventory.CustomInt3State = true;
                                    inventory.CustomInt3Name = customFieldDto.Name;
                                }
                                intFieldIndex++;
                                break;
                                
                            case "checkbox":
                            case "bool":
                            case "boolean":
                                if (boolFieldIndex == 1)
                                {
                                    inventory.CustomBool1State = true;
                                    inventory.CustomBool1Name = customFieldDto.Name;
                                }
                                else if (boolFieldIndex == 2)
                                {
                                    inventory.CustomBool2State = true;
                                    inventory.CustomBool2Name = customFieldDto.Name;
                                }
                                else if (boolFieldIndex == 3)
                                {
                                    inventory.CustomBool3State = true;
                                    inventory.CustomBool3Name = customFieldDto.Name;
                                }
                                boolFieldIndex++;
                                break;
                                
                            case "date":
                            case "datetime":
                                if (dateFieldIndex == 1)
                                {
                                    inventory.CustomDate1State = true;
                                    inventory.CustomDate1Name = customFieldDto.Name;
                                }
                                else if (dateFieldIndex == 2)
                                {
                                    inventory.CustomDate2State = true;
                                    inventory.CustomDate2Name = customFieldDto.Name;
                                }
                                else if (dateFieldIndex == 3)
                                {
                                    inventory.CustomDate3State = true;
                                    inventory.CustomDate3Name = customFieldDto.Name;
                                }
                                dateFieldIndex++;
                                break;
                                
                            case "decimal":
                            case "money":
                            case "currency":
                                if (decimalFieldIndex == 1)
                                {
                                    inventory.CustomDecimal1State = true;
                                    inventory.CustomDecimal1Name = customFieldDto.Name;
                                }
                                else if (decimalFieldIndex == 2)
                                {
                                    inventory.CustomDecimal2State = true;
                                    inventory.CustomDecimal2Name = customFieldDto.Name;
                                }
                                else if (decimalFieldIndex == 3)
                                {
                                    inventory.CustomDecimal3State = true;
                                    inventory.CustomDecimal3Name = customFieldDto.Name;
                                }
                                decimalFieldIndex++;
                                break;
                        }
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
