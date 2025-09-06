namespace ToryBack.Models.DTOs
{
    public class CustomIdFormatDto
    {
        public string Format { get; set; } = string.Empty;
        public bool Enabled { get; set; }
        public string Preview { get; set; } = string.Empty;
    }
}
