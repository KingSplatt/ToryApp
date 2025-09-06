namespace ToryBack.Models.DTOs
{
    public class CreateInventoryDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public string OwnerId { get; set; } = string.Empty;
        public List<string>? Tags { get; set; }
        public List<CreateCustomFieldDto>? CustomFields { get; set; }
    }
}
