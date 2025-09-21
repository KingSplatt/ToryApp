using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToryBack.Models
{
    [Table("discussion_posts")]
    public class DiscussionPost
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }
        
        [Required]
        [Column("InventoryId")]
        public int InventoryId { get; set; }
        public Inventory Inventory { get; set; } = null!;
        
        [Required]
        [Column("AuthorId")]
        public string AuthorId { get; set; } = string.Empty;
        public User Author { get; set; } = null!;
        
        [Required]
        [Column("Content")]
        public string Content { get; set; } = string.Empty; // Markdown support
        
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("LikesCount")]
        public int LikesCount { get; set; } = 0;
        
        // Navigation properties
        public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    }
    
    [Table("post_likes")]
    public class PostLike
    {
        [Column("UserId")]
        public string UserId { get; set; } = string.Empty;
        public User User { get; set; } = null!;
        
        [Column("PostId")]
        public int PostId { get; set; }
        public DiscussionPost Post { get; set; } = null!;
        
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
