namespace ToryBack.Models.DTOs
{
    public class InventoryDetailDto : InventoryDto
    {
        public DateTime CreatedAt { get; set; }
        public List<CustomFieldDto> CustomFields { get; set; } = new();
        public string? CustomIdFormat { get; set; }
        public bool CustomIdEnabled { get; set; }
    }
}
