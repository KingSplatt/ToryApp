namespace ToryBack.Models.DTOs
{
    public class DiscussDto
    {
        public int Id { get; set; }
        public int InventoryId { get; set; }
        public string? AuthorId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int LikesCount { get; set; }
    }
}