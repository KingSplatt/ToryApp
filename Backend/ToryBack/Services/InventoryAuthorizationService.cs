using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;

namespace ToryBack.Services
{
    public interface IInventoryAuthorizationService
    {
        Task<bool> CanUserAccessInventoryAsync(string userId, int inventoryId, AccessLevel requiredLevel);
        Task<bool> IsInventoryOwnerAsync(string userId, int inventoryId);
        Task<AccessLevel?> GetUserAccessLevelAsync(string userId, int inventoryId);
        Task GrantCreatorAccessAsync(string userId, int inventoryId);
        Task<bool> CanUserCreateItemsAsync(string userId, int inventoryId);
        Task<bool> CanUserEditItemsAsync(string userId, int inventoryId);
        Task<bool> CanUserDeleteItemsAsync(string userId, int inventoryId);
    }

    public class InventoryAuthorizationService : IInventoryAuthorizationService
    {
        private readonly ApplicationDbContext _context;

        public InventoryAuthorizationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CanUserAccessInventoryAsync(string userId, int inventoryId, AccessLevel requiredLevel)
        {
            var inventory = await _context.Inventories
                .Include(i => i.AccessList)
                .FirstOrDefaultAsync(i => i.Id == inventoryId);

            if (inventory == null)
                return false;

            // If inventory is public and user only needs read access
            if (inventory.IsPublic && requiredLevel == AccessLevel.Read)
                return true;

            // Check if user is the owner
            if (inventory.OwnerId == userId)
                return true;

            // Check explicit access permissions
            var userAccess = inventory.AccessList
                .FirstOrDefault(a => a.UserId == userId);

            if (userAccess == null)
                return false;

            // Check if user has required access level or higher
            return userAccess.AccessLevel >= requiredLevel;
        }

        public async Task<bool> IsInventoryOwnerAsync(string userId, int inventoryId)
        {
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.Id == inventoryId);

            return inventory?.OwnerId == userId;
        }

        public async Task<AccessLevel?> GetUserAccessLevelAsync(string userId, int inventoryId)
        {
            var inventory = await _context.Inventories
                .Include(i => i.AccessList)
                .FirstOrDefaultAsync(i => i.Id == inventoryId);

            if (inventory == null)
                return null;

            // Owner has Creator access
            if (inventory.OwnerId == userId)
                return AccessLevel.Creator;

            // Check explicit permissions
            var userAccess = inventory.AccessList
                .FirstOrDefault(a => a.UserId == userId);

            if (userAccess != null)
                return userAccess.AccessLevel;

            // If inventory is public, user has read access
            if (inventory.IsPublic)
                return AccessLevel.Read;

            return null;
        }

        public async Task GrantCreatorAccessAsync(string userId, int inventoryId)
        { 
            // Check if access record already exists
            var existingAccess = await _context.InventoryAccess
                .FirstOrDefaultAsync(ia => ia.InventoryId == inventoryId && ia.UserId == userId);

            if (existingAccess == null)
            {
                var creatorAccess = new InventoryAccess
                {
                    InventoryId = inventoryId,
                    UserId = userId,
                    AccessLevel = AccessLevel.Creator,
                    GrantedAt = DateTime.UtcNow
                };

                _context.InventoryAccess.Add(creatorAccess);
                await _context.SaveChangesAsync();
            }
        }

        public async Task GrantWriterAccessAsync(string userId, int inventoryId)
        {
            // Check if access record already exists
            var existingAccess = await _context.InventoryAccess
                .FirstOrDefaultAsync(ia => ia.InventoryId == inventoryId && ia.UserId == userId);

            if (existingAccess == null)
            {
                var writerAccess = new InventoryAccess
                {
                    InventoryId = inventoryId,
                    UserId = userId,
                    AccessLevel = AccessLevel.Write,
                    GrantedAt = DateTime.UtcNow
                };

                _context.InventoryAccess.Add(writerAccess);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> CanUserCreateItemsAsync(string userId, int inventoryId)
        {
            return await CanUserAccessInventoryAsync(userId, inventoryId, AccessLevel.Write);
        }

        public async Task<bool> CanUserEditItemsAsync(string userId, int inventoryId)
        {
            return await CanUserAccessInventoryAsync(userId, inventoryId, AccessLevel.Write);
        }

        public async Task<bool> CanUserDeleteItemsAsync(string userId, int inventoryId)
        {
            return await CanUserAccessInventoryAsync(userId, inventoryId, AccessLevel.Write);
        }
    }
}
