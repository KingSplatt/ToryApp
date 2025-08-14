using System.ComponentModel.DataAnnotations;

namespace ToryBack.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }
        
        // Navigation properties
        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    }
    
    public class Tag
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
        
        public int UsageCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<InventoryTag> InventoryTags { get; set; } = new List<InventoryTag>();
    }
    
    public class InventoryTag
    {
        public int InventoryId { get; set; }
        public Inventory Inventory { get; set; } = null!;
        
        public int TagId { get; set; }
        public Tag Tag { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
