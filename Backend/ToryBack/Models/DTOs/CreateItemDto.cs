using System.ComponentModel.DataAnnotations;

namespace ToryBack.Models.DTOs
{
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
}
