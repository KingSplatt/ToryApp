namespace ToryBack.Models.DTOs
{
    public class UpdateInventoryDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public List<string>? Tags { get; set; }
        public string? ImageUrl { get; set; }
    }
}
