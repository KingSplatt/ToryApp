using System.ComponentModel.DataAnnotations;

namespace ToryBack.Models
{
    public class DiscussionPost
    {
        public int Id { get; set; }
        
        [Required]
        public int InventoryId { get; set; }
        public Inventory Inventory { get; set; } = null!;
        
        [Required]
        public string AuthorId { get; set; } = string.Empty;
        public User Author { get; set; } = null!;
        
        [Required]
        public string Content { get; set; } = string.Empty; // Markdown support
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int LikesCount { get; set; } = 0;
        
        // Navigation properties
        public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    }
    
    public class PostLike
    {
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;
        
        public int PostId { get; set; }
        public DiscussionPost Post { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
