using System.ComponentModel.DataAnnotations;

namespace ToryBack.Models.DTOs
{
    public class ItemDto
    {
        public int Id { get; set; }
        public string? CustomId { get; set; }
        public int InventoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<CustomFieldValueDto> CustomFieldValues { get; set; } = new();

        public string? ImgUrl { get; set; } = string.Empty;
    }
}
