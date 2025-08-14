using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToryBack.Models
{
    public class Inventory
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty; // Markdown support
        
        [Required]
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        
        public string? ImageUrl { get; set; } // Cloud storage URL
        
        public bool IsPublic { get; set; } = true;
        
        [Required]
        public string OwnerId { get; set; } = string.Empty;
        public User Owner { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Optimistic locking
        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;
        
        // Navigation properties
        public ICollection<InventoryItem> Items { get; set; } = new List<InventoryItem>();
        public ICollection<InventoryTag> InventoryTags { get; set; } = new List<InventoryTag>();
        public ICollection<InventoryAccess> AccessList { get; set; } = new List<InventoryAccess>();
        public ICollection<DiscussionPost> DiscussionPosts { get; set; } = new List<DiscussionPost>();
        public ICollection<CustomField> CustomFields { get; set; } = new List<CustomField>();
    }
    
    public class InventoryAccess
    {
        public int InventoryId { get; set; }
        public Inventory Inventory { get; set; } = null!;
        
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;
        
        public AccessLevel AccessLevel { get; set; } = AccessLevel.Read;
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    }
    
    public enum AccessLevel
    {
        Read = 1,
        Write = 2,
        Admin = 3
    }
}
