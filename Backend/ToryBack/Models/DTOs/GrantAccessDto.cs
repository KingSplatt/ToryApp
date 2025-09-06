using ToryBack.Models;

namespace ToryBack.Models.DTOs
{
    public class GrantAccessDto
    {
        public string UserId { get; set; } = string.Empty;
        public AccessLevel AccessLevel { get; set; } = AccessLevel.Read;
    }
}
