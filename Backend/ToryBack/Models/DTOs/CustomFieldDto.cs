namespace ToryBack.Models.DTOs
{
    public class CustomFieldDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool ShowInTable { get; set; }
    }
}
