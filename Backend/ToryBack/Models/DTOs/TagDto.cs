namespace ToryBack.Models.DTOs
{
    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int UsageCount { get; set; }
    }
}
