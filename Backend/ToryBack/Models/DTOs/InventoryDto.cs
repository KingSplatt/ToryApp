namespace ToryBack.Models.DTOs
{
    public class InventoryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public bool IsPublic { get; set; }
        public string Owner { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
        public List<string> Tags { get; set; } = new();
        public string? ImageUrl { get; set; }
    }
}
