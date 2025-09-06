namespace ToryBack.Models.DTOs
{
    public class BlockUsersRequest
    {
        public List<string> UserIds { get; set; } = new();
    }
}
