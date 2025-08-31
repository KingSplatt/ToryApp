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
        
        // Custom String Fields (up to 3)
        public bool CustomString1State { get; set; } = false;
        [StringLength(100)]
        public string? CustomString1Name { get; set; }
        
        public bool CustomString2State { get; set; } = false;
        [StringLength(100)]
        public string? CustomString2Name { get; set; }
        
        public bool CustomString3State { get; set; } = false;
        [StringLength(100)]
        public string? CustomString3Name { get; set; }
        
        // Custom Integer Fields (up to 3)
        public bool CustomInt1State { get; set; } = false;
        [StringLength(100)]
        public string? CustomInt1Name { get; set; }
        
        public bool CustomInt2State { get; set; } = false;
        [StringLength(100)]
        public string? CustomInt2Name { get; set; }
        
        public bool CustomInt3State { get; set; } = false;
        [StringLength(100)]
        public string? CustomInt3Name { get; set; }
        
        // Custom Boolean Fields (up to 3)
        public bool CustomBool1State { get; set; } = false;
        [StringLength(100)]
        public string? CustomBool1Name { get; set; }
        
        public bool CustomBool2State { get; set; } = false;
        [StringLength(100)]
        public string? CustomBool2Name { get; set; }
        
        public bool CustomBool3State { get; set; } = false;
        [StringLength(100)]
        public string? CustomBool3Name { get; set; }
        
        // Custom Date Fields (up to 3)
        public bool CustomDate1State { get; set; } = false;
        [StringLength(100)]
        public string? CustomDate1Name { get; set; }
        
        public bool CustomDate2State { get; set; } = false;
        [StringLength(100)]
        public string? CustomDate2Name { get; set; }
        
        public bool CustomDate3State { get; set; } = false;
        [StringLength(100)]
        public string? CustomDate3Name { get; set; }
        
        // Custom Decimal Fields (up to 3)
        public bool CustomDecimal1State { get; set; } = false;
        [StringLength(100)]
        public string? CustomDecimal1Name { get; set; }
        
        public bool CustomDecimal2State { get; set; } = false;
        [StringLength(100)]
        public string? CustomDecimal2Name { get; set; }
        
        public bool CustomDecimal3State { get; set; } = false;
        [StringLength(100)]
        public string? CustomDecimal3Name { get; set; }
        
        // Navigation properties
        public ICollection<Item> Items { get; set; } = new List<Item>();
        public ICollection<InventoryTag> InventoryTags { get; set; } = new List<InventoryTag>();
        public ICollection<InventoryAccess> AccessList { get; set; } = new List<InventoryAccess>();
        public ICollection<DiscussionPost> DiscussionPosts { get; set; } = new List<DiscussionPost>();
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

        Creator = 3,
        Admin = 4
    }
}
