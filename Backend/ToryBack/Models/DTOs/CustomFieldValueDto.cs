namespace ToryBack.Models.DTOs
{
    public class CustomFieldValueDto
    {
        public int FieldId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Value { get; set; }
    }
}
