using Microsoft.AspNetCore.Identity;
using ToryBack.Models;

namespace ToryBack.Services
{
    public class RoleInitializerService
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<User> _userManager;

        public RoleInitializerService(RoleManager<IdentityRole> roleManager, UserManager<User> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public async Task InitializeRolesAsync()
        {
            string[] roleNames = { "Admin", "AuthUser", "Public" };

            foreach (var roleName in roleNames)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
        }

        public async Task AssignRoleToUserAsync(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null && await _roleManager.RoleExistsAsync(roleName))
            {
                if (!await _userManager.IsInRoleAsync(user, roleName))
                {
                    await _userManager.AddToRoleAsync(user, roleName);
                }
            }
        }

        public async Task<List<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                return roles.ToList();
            }
            return new List<string>();
        }

        public async Task RemoveUserFromRoleAsync(string userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null && await _roleManager.RoleExistsAsync(roleName))
            {
                await _userManager.RemoveFromRoleAsync(user, roleName);
            }
        }

        public async Task CreateAdminUserAsync(string email, string password, string fullName)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser == null)
            {
                var adminUser = new User
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    RegistrationTime = DateTime.UtcNow,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(adminUser, password);
                if (result.Succeeded)
                {
                    await AssignRoleToUserAsync(adminUser.Id, "Admin");
                }
            }
            else
            {
                // Si el usuario existe, asegurar que tiene rol de Admin
                await AssignRoleToUserAsync(existingUser.Id, "Admin");
            }
        }
    }
}
