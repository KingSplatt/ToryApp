using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToryBack.Models
{
    public class Discuss
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Column("InventoryId")]
        public int InventoryId { get; set; }
        public Inventory Inventory { get; set; } = null!;
        [Column("AuthorId")]
        public string? AuthorId { get; set; }
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }
        [Column("LikesCount")]
        public int LikesCount { get; set; } = 0;

    }
}