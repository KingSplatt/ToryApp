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
        public Inventory Inventory { get; set; } = null!;
        
        [Required]
        [Column("Name")]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Column("Description")]
        public string? Description { get; set; }
        
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Optimistic locking
        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;
        
        // Custom String Field Values
        [Column("custom_string1_value")]
        public string? CustomString1Value { get; set; }
        
        [Column("custom_string2_value")]
        public string? CustomString2Value { get; set; }
        
        [Column("custom_string3_value")]
        public string? CustomString3Value { get; set; }
        
        // Custom Integer Field Values
        [Column("custom_int1_value")]
        public int? CustomInt1Value { get; set; }
        
        [Column("custom_int2_value")]
        public int? CustomInt2Value { get; set; }
        
        [Column("custom_int3_value")]
        public int? CustomInt3Value { get; set; }
        
        // Custom Boolean Field Values
        [Column("custom_bool1_value")]
        public bool? CustomBool1Value { get; set; }
        
        [Column("custom_bool2_value")]
        public bool? CustomBool2Value { get; set; }
        
        [Column("custom_bool3_value")]
        public bool? CustomBool3Value { get; set; }
        
        // Custom Date Field Values
        [Column("custom_date1_value")]
        public DateTime? CustomDate1Value { get; set; }
        
        [Column("custom_date2_value")]
        public DateTime? CustomDate2Value { get; set; }
        
        [Column("custom_date3_value")]
        public DateTime? CustomDate3Value { get; set; }
        
        // Custom Decimal Field Values
        [Column("custom_decimal1_value", TypeName = "decimal(18,4)")]
        public decimal? CustomDecimal1Value { get; set; }
        
        [Column("custom_decimal2_value", TypeName = "decimal(18,4)")]
        public decimal? CustomDecimal2Value { get; set; }
        
        [Column("custom_decimal3_value", TypeName = "decimal(18,4)")]
        public decimal? CustomDecimal3Value { get; set; }
    }
}
