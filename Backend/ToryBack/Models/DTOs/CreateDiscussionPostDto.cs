namespace ToryBack.Models.DTOs
{
    public class CreateDiscussionPostDto
    {
        public int InventoryId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
