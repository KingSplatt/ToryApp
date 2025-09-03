using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;
using Microsoft.AspNetCore.Identity;
using ToryBack.Services;
using System.ComponentModel.DataAnnotations;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ItemsController> _logger;
        private readonly UserManager<User> _userManager;
        private readonly IInventoryAuthorizationService _authorizationService;

        public ItemsController(
            ApplicationDbContext context, 
            ILogger<ItemsController> logger, 
            UserManager<User> userManager,
            IInventoryAuthorizationService authorizationService)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _authorizationService = authorizationService;
        }

        [HttpGet("inventory/{inventoryId}")]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetInventoryItems(int inventoryId)
        {

            var items = await _context.Items
                .Where(i => i.InventoryId == inventoryId)
                .OrderBy(i => i.Name)
                .ToListAsync();

            // Get inventory custom fields for reference
            var inventory_info = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == inventoryId);

            var result = items.Select(item => new ItemDto
            {
                Id = item.Id,
                CustomId = item.CustomId,
                InventoryId = item.InventoryId,
                Name = item.Name,
                Description = item.Description ?? string.Empty,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                CustomFieldValues = GetItemCustomFieldValues(item, inventory_info!)
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemDto>> GetItem(int id)
        {
            var item = await _context.Items
                .Include(i => i.Inventory)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
                return NotFound();

            // Get current user ID
            string? currentUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var currentUser = await _userManager.FindByNameAsync(User.Identity.Name!);
                currentUserId = currentUser?.Id;
            }

            // Check if user can access this inventory
            if (currentUserId != null)
            {
                var canAccess = await _authorizationService.CanUserAccessInventoryAsync(currentUserId, item.InventoryId, AccessLevel.Read);
                if (!canAccess)
                    return StatusCode(403, "You don't have permission to access this inventory");
            }
            else if (!item.Inventory.IsPublic)
            {
                return StatusCode(403, "This inventory is private");
            }

            var result = new ItemDto
            {
                Id = item.Id,
                CustomId = item.CustomId,
                InventoryId = item.InventoryId,
                Name = item.Name,
                Description = item.Description ?? string.Empty,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                CustomFieldValues = GetItemCustomFieldValues(item, item.Inventory)
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ItemDto>> CreateItem(CreateItemDto createDto)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (string.IsNullOrWhiteSpace(createDto.Name))
                    return BadRequest("Item name is required");

                // Get current user ID
                string? currentUserId = null;
                if (User.Identity?.IsAuthenticated == true)
                {
                    var currentUser = await _userManager.FindByNameAsync(User.Identity.Name!);
                    currentUserId = currentUser?.Id;
                }
                var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == createDto.InventoryId);
                if (inventory == null)
                    return NotFound("Inventory not found");

                // Check if CustomId is unique within the inventory (if provided)
                if (!string.IsNullOrWhiteSpace(createDto.CustomId))
                {
                    var existingItem = await _context.Items
                        .FirstOrDefaultAsync(i => i.InventoryId == createDto.InventoryId && 
                                                 i.CustomId == createDto.CustomId);
                    if (existingItem != null)
                        return BadRequest("An item with this CustomId already exists in this inventory");
                }

                // Create item
                var item = new Item
                {
                    CustomId = createDto.CustomId,
                    InventoryId = createDto.InventoryId,
                    Name = createDto.Name,
                    Description = createDto.Description ?? string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Set custom field values
                SetItemCustomFieldValues(item, createDto.CustomFieldValues, inventory);

                _context.Items.Add(item);
                
                // Update inventory's UpdatedAt timestamp
                inventory.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                var result = new ItemDto
                {
                    Id = item.Id,
                    CustomId = item.CustomId,
                    InventoryId = item.InventoryId,
                    Name = item.Name,
                    Description = item.Description,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    CustomFieldValues = GetItemCustomFieldValues(item, inventory)
                };

                return CreatedAtAction(nameof(GetItem), new { id = item.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating item");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ItemDto>> UpdateItem(int id, UpdateItemDto updateDto)
        {
            try
            {
                // Validate model
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (string.IsNullOrWhiteSpace(updateDto.Name))
                    return BadRequest("Item name is required");

                var item = await _context.Items
                    .Include(i => i.Inventory)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (item == null)
                    return NotFound();

                // Get current user ID
                string? currentUserId = null;
                if (User.Identity?.IsAuthenticated == true)
                {
                    var currentUser = await _userManager.FindByNameAsync(User.Identity.Name!);
                    currentUserId = currentUser?.Id;
                }

                if (currentUserId == null)
                    return Unauthorized("You must be logged in to edit items");

                // Check if user can edit items in this inventory
                var canEditItems = await _authorizationService.CanUserEditItemsAsync(currentUserId, item.InventoryId);
                if (!canEditItems)
                    return StatusCode(403, "You don't have permission to edit items in this inventory");

                // Check if CustomId is unique within the inventory (if provided and different from current)
                if (!string.IsNullOrWhiteSpace(updateDto.CustomId) && updateDto.CustomId != item.CustomId)
                {
                    var existingItem = await _context.Items
                        .FirstOrDefaultAsync(i => i.InventoryId == item.InventoryId && 
                                                 i.CustomId == updateDto.CustomId);
                    if (existingItem != null)
                        return BadRequest("An item with this CustomId already exists in this inventory");
                }

                // Update item properties
                item.Name = updateDto.Name;
                item.Description = updateDto.Description ?? string.Empty;
                item.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(updateDto.CustomId))
                    item.CustomId = updateDto.CustomId;

                // Update custom field values
                SetItemCustomFieldValues(item, updateDto.CustomFieldValues, item.Inventory);

                // Update inventory's UpdatedAt timestamp
                item.Inventory.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var result = new ItemDto
                {
                    Id = item.Id,
                    CustomId = item.CustomId,
                    InventoryId = item.InventoryId,
                    Name = item.Name,
                    Description = item.Description,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    CustomFieldValues = GetItemCustomFieldValues(item, item.Inventory)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating item");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteItem(int id)
        {
            try
            {
                var item = await _context.Items
                    .Include(i => i.Inventory)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (item == null)
                    return NotFound();

                // Get current user ID
                string? currentUserId = null;
                if (User.Identity?.IsAuthenticated == true)
                {
                    var currentUser = await _userManager.FindByNameAsync(User.Identity.Name!);
                    currentUserId = currentUser?.Id;
                }

                if (currentUserId == null)
                    return Unauthorized("You must be logged in to delete items");

                // Check if user can delete items in this inventory
                var canDeleteItems = await _authorizationService.CanUserDeleteItemsAsync(currentUserId, item.InventoryId);
                if (!canDeleteItems)
                    return StatusCode(403, "You don't have permission to delete items in this inventory");

                _context.Items.Remove(item);
                
                // Update inventory's UpdatedAt timestamp
                item.Inventory.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting item");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("bulk-delete")]
        public async Task<ActionResult> DeleteItems([FromBody] List<int> itemIds)
        {
            try
            {
                if (itemIds == null || itemIds.Count == 0)
                    return BadRequest("No item IDs provided for deletion");

                var items = await _context.Items
                    .Include(i => i.Inventory)
                    .Where(i => itemIds.Contains(i.Id))
                    .ToListAsync();

                if (items.Count == 0)
                    return NotFound("No items found for the provided IDs");

                // Get current user ID
                string? currentUserId = null;
                if (User.Identity?.IsAuthenticated == true)
                {
                    var currentUser = await _userManager.FindByNameAsync(User.Identity.Name!);
                    currentUserId = currentUser?.Id;
                }

                if (currentUserId == null)
                    return Unauthorized("You must be logged in to delete items");

                // Check permissions for each item's inventory
                foreach (var item in items)
                {
                    var canDeleteItems = await _authorizationService.CanUserDeleteItemsAsync(currentUserId, item.InventoryId);
                    if (!canDeleteItems)
                        return StatusCode(403, $"You don't have permission to delete items in inventory ID {item.InventoryId}");
                }

                _context.Items.RemoveRange(items);

                // Update UpdatedAt timestamp for affected inventories
                var affectedInventories = items.Select(i => i.Inventory).Distinct();
                foreach (var inventory in affectedInventories)
                {
                    inventory.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting items");
                return StatusCode(500, "Internal server error");
            }
        }

        // Helper methods for custom fields
        private static List<CustomFieldValueDto> GetItemCustomFieldValues(Item item, Inventory inventory)
        {
            var values = new List<CustomFieldValueDto>();

            // String fields
            if (inventory.CustomString1State && !string.IsNullOrEmpty(inventory.CustomString1Name))
                values.Add(new CustomFieldValueDto { FieldId = 1, Name = inventory.CustomString1Name, Type = "Text", Value = item.CustomString1Value });
            if (inventory.CustomString2State && !string.IsNullOrEmpty(inventory.CustomString2Name))
                values.Add(new CustomFieldValueDto { FieldId = 2, Name = inventory.CustomString2Name, Type = "Text", Value = item.CustomString2Value });
            if (inventory.CustomString3State && !string.IsNullOrEmpty(inventory.CustomString3Name))
                values.Add(new CustomFieldValueDto { FieldId = 3, Name = inventory.CustomString3Name, Type = "Text", Value = item.CustomString3Value });

            // Integer fields
            if (inventory.CustomInt1State && !string.IsNullOrEmpty(inventory.CustomInt1Name))
                values.Add(new CustomFieldValueDto { FieldId = 4, Name = inventory.CustomInt1Name, Type = "Number", Value = item.CustomInt1Value?.ToString() });
            if (inventory.CustomInt2State && !string.IsNullOrEmpty(inventory.CustomInt2Name))
                values.Add(new CustomFieldValueDto { FieldId = 5, Name = inventory.CustomInt2Name, Type = "Number", Value = item.CustomInt2Value?.ToString() });
            if (inventory.CustomInt3State && !string.IsNullOrEmpty(inventory.CustomInt3Name))
                values.Add(new CustomFieldValueDto { FieldId = 6, Name = inventory.CustomInt3Name, Type = "Number", Value = item.CustomInt3Value?.ToString() });

            // Boolean fields
            if (inventory.CustomBool1State && !string.IsNullOrEmpty(inventory.CustomBool1Name))
                values.Add(new CustomFieldValueDto { FieldId = 7, Name = inventory.CustomBool1Name, Type = "Checkbox", Value = item.CustomBool1Value?.ToString() });
            if (inventory.CustomBool2State && !string.IsNullOrEmpty(inventory.CustomBool2Name))
                values.Add(new CustomFieldValueDto { FieldId = 8, Name = inventory.CustomBool2Name, Type = "Checkbox", Value = item.CustomBool2Value?.ToString() });
            if (inventory.CustomBool3State && !string.IsNullOrEmpty(inventory.CustomBool3Name))
                values.Add(new CustomFieldValueDto { FieldId = 9, Name = inventory.CustomBool3Name, Type = "Checkbox", Value = item.CustomBool3Value?.ToString() });

            // Date fields
            if (inventory.CustomDate1State && !string.IsNullOrEmpty(inventory.CustomDate1Name))
                values.Add(new CustomFieldValueDto { FieldId = 10, Name = inventory.CustomDate1Name, Type = "Date", Value = item.CustomDate1Value?.ToString("yyyy-MM-dd") });
            if (inventory.CustomDate2State && !string.IsNullOrEmpty(inventory.CustomDate2Name))
                values.Add(new CustomFieldValueDto { FieldId = 11, Name = inventory.CustomDate2Name, Type = "Date", Value = item.CustomDate2Value?.ToString("yyyy-MM-dd") });
            if (inventory.CustomDate3State && !string.IsNullOrEmpty(inventory.CustomDate3Name))
                values.Add(new CustomFieldValueDto { FieldId = 12, Name = inventory.CustomDate3Name, Type = "Date", Value = item.CustomDate3Value?.ToString("yyyy-MM-dd") });

            // Decimal fields
            if (inventory.CustomDecimal1State && !string.IsNullOrEmpty(inventory.CustomDecimal1Name))
                values.Add(new CustomFieldValueDto { FieldId = 13, Name = inventory.CustomDecimal1Name, Type = "Decimal", Value = item.CustomDecimal1Value?.ToString() });
            if (inventory.CustomDecimal2State && !string.IsNullOrEmpty(inventory.CustomDecimal2Name))
                values.Add(new CustomFieldValueDto { FieldId = 14, Name = inventory.CustomDecimal2Name, Type = "Decimal", Value = item.CustomDecimal2Value?.ToString() });
            if (inventory.CustomDecimal3State && !string.IsNullOrEmpty(inventory.CustomDecimal3Name))
                values.Add(new CustomFieldValueDto { FieldId = 15, Name = inventory.CustomDecimal3Name, Type = "Decimal", Value = item.CustomDecimal3Value?.ToString() });

            return values;
        }

        private static void SetItemCustomFieldValues(Item item, List<CustomFieldValueDto>? customFieldValues, Inventory inventory)
        {
            if (customFieldValues == null) return;

            foreach (var fieldValue in customFieldValues)
            {
                switch (fieldValue.FieldId)
                {
                    // String fields
                    case 1:
                        if (inventory.CustomString1State)
                            item.CustomString1Value = fieldValue.Value;
                        break;
                    case 2:
                        if (inventory.CustomString2State)
                            item.CustomString2Value = fieldValue.Value;
                        break;
                    case 3:
                        if (inventory.CustomString3State)
                            item.CustomString3Value = fieldValue.Value;
                        break;

                    // Integer fields
                    case 4:
                        if (inventory.CustomInt1State && int.TryParse(fieldValue.Value, out int intVal1))
                            item.CustomInt1Value = intVal1;
                        break;
                    case 5:
                        if (inventory.CustomInt2State && int.TryParse(fieldValue.Value, out int intVal2))
                            item.CustomInt2Value = intVal2;
                        break;
                    case 6:
                        if (inventory.CustomInt3State && int.TryParse(fieldValue.Value, out int intVal3))
                            item.CustomInt3Value = intVal3;
                        break;

                    // Boolean fields
                    case 7:
                        if (inventory.CustomBool1State && bool.TryParse(fieldValue.Value, out bool boolVal1))
                            item.CustomBool1Value = boolVal1;
                        break;
                    case 8:
                        if (inventory.CustomBool2State && bool.TryParse(fieldValue.Value, out bool boolVal2))
                            item.CustomBool2Value = boolVal2;
                        break;
                    case 9:
                        if (inventory.CustomBool3State && bool.TryParse(fieldValue.Value, out bool boolVal3))
                            item.CustomBool3Value = boolVal3;
                        break;

                    // Date fields
                    case 10:
                        if (inventory.CustomDate1State && DateTime.TryParse(fieldValue.Value, out DateTime dateVal1))
                            item.CustomDate1Value = dateVal1;
                        break;
                    case 11:
                        if (inventory.CustomDate2State && DateTime.TryParse(fieldValue.Value, out DateTime dateVal2))
                            item.CustomDate2Value = dateVal2;
                        break;
                    case 12:
                        if (inventory.CustomDate3State && DateTime.TryParse(fieldValue.Value, out DateTime dateVal3))
                            item.CustomDate3Value = dateVal3;
                        break;

                    // Decimal fields
                    case 13:
                        if (inventory.CustomDecimal1State && decimal.TryParse(fieldValue.Value, out decimal decVal1))
                            item.CustomDecimal1Value = decVal1;
                        break;
                    case 14:
                        if (inventory.CustomDecimal2State && decimal.TryParse(fieldValue.Value, out decimal decVal2))
                            item.CustomDecimal2Value = decVal2;
                        break;
                    case 15:
                        if (inventory.CustomDecimal3State && decimal.TryParse(fieldValue.Value, out decimal decVal3))
                            item.CustomDecimal3Value = decVal3;
                        break;
                }
            }
        }
    }

    // DTOs
    public class ItemDto
    {
        public int Id { get; set; }
        public string? CustomId { get; set; }
        public int InventoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<CustomFieldValueDto> CustomFieldValues { get; set; } = new();
    }

    public class CreateItemDto
    {
        [StringLength(100)]
        public string? CustomId { get; set; }
        
        [Required]
        public int InventoryId { get; set; }
        
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        public List<CustomFieldValueDto>? CustomFieldValues { get; set; }
    }

    public class UpdateItemDto
    {
        [StringLength(100)]
        public string? CustomId { get; set; }
        
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        public List<CustomFieldValueDto>? CustomFieldValues { get; set; }
    }

    public class CustomFieldValueDto
    {
        public int FieldId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Value { get; set; }
    }
}
