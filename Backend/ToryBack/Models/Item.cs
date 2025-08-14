using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToryBack.Models
{
    [Table("items")]
    public class Item
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }
        
        [Column("CustomId")]
        [StringLength(100)]
        public string? CustomId { get; set; }
        [Required]
        [Column("InventoryId")]
        public int InventoryId { get; set; }
        
        [Required]
        [Column("Name")]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Column("CreateAt")]
        public DateTime CreateAt { get; set; } = DateTime.Now;
    }
}
