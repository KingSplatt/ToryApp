namespace ToryBack.Models.DTOs.AccountDTOs
{
    public class BlockUsersRequest
    {
        public List<string> UserIds { get; set; } = new();
    }
}
