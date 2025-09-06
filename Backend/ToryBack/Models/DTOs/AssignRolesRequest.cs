namespace ToryBack.Models.DTOs
{
    public class AssignRolesRequest
    {
        public List<string> UserIds { get; set; } = new();
        public List<string> RoleNames { get; set; } = new();
    }
}
