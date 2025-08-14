using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToryBack.Models
{
    public class InventoryItem
    {
        public int Id { get; set; }
        
        [Required]
        public int InventoryId { get; set; }
        public Inventory Inventory { get; set; } = null!;
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        // Custom ID per inventory (unique within each inventory)
        [StringLength(100)]
        public string? CustomId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Optimistic locking
        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;
        
        // Navigation properties
        public ICollection<CustomFieldValue> CustomFieldValues { get; set; } = new List<CustomFieldValue>();
    }
    
    public class CustomField
    {
        public int Id { get; set; }
        
        [Required]
        public int InventoryId { get; set; }
        public Inventory Inventory { get; set; } = null!;
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public FieldType Type { get; set; }
        
        public bool ShowInTable { get; set; } = false;
        public int SortOrder { get; set; }
        
        // Field validation rules (JSON)
        public string? ValidationRules { get; set; }
        
        // For dropdown fields: options as JSON array
        public string? Options { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<CustomFieldValue> Values { get; set; } = new List<CustomFieldValue>();
    }
    
    public class CustomFieldValue
    {
        public int Id { get; set; }
        
        [Required]
        public int ItemId { get; set; }
        public InventoryItem Item { get; set; } = null!;
        
        [Required]
        public int CustomFieldId { get; set; }
        public CustomField CustomField { get; set; } = null!;
        
        public string? TextValue { get; set; }
        public decimal? NumberValue { get; set; }
        public bool? BooleanValue { get; set; }
        public DateTime? DateValue { get; set; }
    }
    
    public enum FieldType
    {
        Text = 1,
        Number = 2,
        Checkbox = 3,
        Date = 4,
        Dropdown = 5
    }
}
