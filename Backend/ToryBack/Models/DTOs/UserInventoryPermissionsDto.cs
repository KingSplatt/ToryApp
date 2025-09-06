namespace ToryBack.Models.DTOs
{
    public class UserInventoryPermissionsDto
    {
        public int InventoryId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public bool IsOwner { get; set; }
        public string? AccessLevel { get; set; }
        public bool CanRead { get; set; }
        public bool CanWrite { get; set; }
        public bool CanCreateItems { get; set; }
        public bool CanEditItems { get; set; }
        public bool CanDeleteItems { get; set; }
        public bool CanManageInventory { get; set; }
    }
}
