using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace ToryBack.Services
{
    public interface ICustomIdService
    {
        string GenerateCustomId(string? format);
        bool ValidateCustomIdFormat(string format);
        string PreviewCustomId(string format);
        bool IsValidCustomId(string customId, string? format);
    }

    public class CustomIdService : ICustomIdService
    {
        private readonly Random _random = new();

        public string GenerateCustomId(string? format)
        {
            if (string.IsNullOrEmpty(format))
                return string.Empty;

            return ProcessFormat(format);
        }

        public bool ValidateCustomIdFormat(string format)
        {
            if (string.IsNullOrEmpty(format))
                return false;

            try
            {
                ProcessFormat(format);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public string PreviewCustomId(string format)
        {
            try
            {
                return ProcessFormat(format);
            }
            catch
            {
                return "Invalid format";
            }
        }

        public bool IsValidCustomId(string customId, string? format)
        {
            if (string.IsNullOrEmpty(format))
                return !string.IsNullOrEmpty(customId);
            return !string.IsNullOrEmpty(customId) && customId.Length <= 100;
        }

        private string ProcessFormat(string format)
        {
            var result = new StringBuilder();
            var i = 0;
            while (i < format.Length)
            {
                if (format[i] == '{' && i + 1 < format.Length)
                {
                    var endIndex = format.IndexOf('}', i + 1);
                    if (endIndex > i)
                    {
                        var placeholder = format.Substring(i + 1, endIndex - i - 1);
                        var replacement = ProcessPlaceholder(placeholder);
                        result.Append(replacement);
                        i = endIndex + 1;
                    }
                    else
                    {
                        result.Append(format[i]);
                        i++;
                    }
                }
                else
                {
                    result.Append(format[i]);
                    i++;
                }
            }
            Console.WriteLine("Generated Custom ID: " + result.ToString());
            return result.ToString();
        }

        private string ProcessPlaceholder(string placeholder)
        {
            return placeholder.ToLower() switch
            {
                "random20" => GenerateRandomBits(20).ToString(),
                "random32" => GenerateRandomBits(32).ToString(),
                "random6" => _random.Next(100000, 999999).ToString("D6"),
                "random9" => _random.Next(100000000, 999999999).ToString("D9"),
                _ => $"{{{placeholder}}}" // Return as-is if not recognized
            };
        }

        private int GenerateRandomBits(int bits)
        {
            var maxValue = (1 << bits) - 1;
            return _random.Next(0, maxValue + 1);
        }
    }

    public class CustomIdFormatDto
    {
        public string Format { get; set; } = string.Empty;
        public bool Enabled { get; set; }
        public string Preview { get; set; } = string.Empty;
    }

    public class UpdateCustomIdFormatDto
    {
        public string Format { get; set; } = string.Empty;
        public bool Enabled { get; set; }
    }
}