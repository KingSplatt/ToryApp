namespace ToryBack.Models.DTOs
{
    public class CreateCustomFieldDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool ShowInTable { get; set; }
        public int SortOrder { get; set; }
        public string? ValidationRules { get; set; }
        public string? Options { get; set; }
    }
}
