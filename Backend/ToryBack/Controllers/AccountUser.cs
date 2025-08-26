using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using ToryBack.Models;
using ToryBack.Services;
using Microsoft.EntityFrameworkCore;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleInitializerService _roleService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            RoleInitializerService roleService,
            ILogger<AccountController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleService = roleService;
            _logger = logger;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                var user = await _userManager.FindByNameAsync(User.Identity.Name!);
                if (user != null)
                {
                    var roles = await _roleService.GetUserRolesAsync(user.Id);
                    return Ok(new
                    {
                        isAuthenticated = true,
                        user = new
                        {
                            id = user.Id,
                            email = user.Email,
                            fullName = user.FullName,
                            profilePictureUrl = user.ProfilePictureUrl,
                            isOAuthUser = user.IsOAuthUser,
                            isBlocked = user.IsBlocked,
                            blockedAt = user.BlockedAt,
                            roles = roles
                        },
                        timestamp = DateTime.UtcNow
                    });
                }
            }

            return Ok(new
            {
                isAuthenticated = false,
                user = (object?)null,
                timestamp = DateTime.UtcNow
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new User
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
                RegistrationTime = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (result.Succeeded)
            {
                // Asignar rol por defecto al usuario registrado
                await _roleService.AssignRoleToUserAsync(user.Id, "AuthUser");
                _logger.LogInformation("User created a new account with password.");
                return Ok(new { message = "User registered successfully", userId = user.Id });
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }

            return BadRequest(ModelState);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _signInManager.PasswordSignInAsync(
                request.Email, request.Password, request.RememberMe, lockoutOnFailure: false);

            if (result.Succeeded)
            {
                _logger.LogInformation("User logged in.");
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user != null)
                {
                    var roles = await _roleService.GetUserRolesAsync(user.Id);
                    return Ok(new
                    {
                        message = "Login successful",
                        user = new
                        {
                            id = user.Id,
                            email = user.Email,
                            fullName = user.FullName,
                            profilePictureUrl = user.ProfilePictureUrl,
                            isOAuthUser = user.IsOAuthUser,
                            isBlocked = user.IsBlocked,
                            blockedAt = user.BlockedAt,
                            roles = roles
                        }
                    });
                }
            }

            return Unauthorized(new { message = "Invalid email or password" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out.");
            return Ok(new { message = "Logout successful" });
        }

        [HttpGet("login/google")]
        public IActionResult GoogleLogin(string returnUrl = "/")
        {
            var redirectUrl = Url.Action("GoogleCallback", "Account", new { returnUrl });
            Console.WriteLine($"Redirect URL: {redirectUrl}");
            var properties = _signInManager.ConfigureExternalAuthenticationProperties("Google", redirectUrl);
            return Challenge(properties, "Google");
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback(string returnUrl = "/")
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                return Redirect("http://localhost:5173/login?error=external_login_failed");
            }

            // Attempt to sign in with external login provider
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);

            if (result.Succeeded)
            {
                _logger.LogInformation("User logged in with {Name} provider.", info.LoginProvider);
                var existingUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

                if (existingUser != null)
                {
                    var userRoles = await _roleService.GetUserRolesAsync(existingUser.Id);
                    var isBlocked = existingUser.IsBlocked;
                    var blockedAt = existingUser.BlockedAt;
                    if (!userRoles.Contains("AuthUser"))
                    {
                        await _roleService.AssignRoleToUserAsync(existingUser.Id, "AuthUser");
                        _logger.LogInformation("Assigned AuthUser role to existing user {UserId} logged in with {Provider}.", existingUser.Id, info.LoginProvider);
                    }

                    if (!existingUser.IsOAuthUser)
                    {
                        existingUser.IsOAuthUser = true;
                        await _userManager.UpdateAsync(existingUser);
                    }
                    if (isBlocked)
                    {
                        return Redirect($"http://localhost:5173/login?error=account_blocked&blockedAt={blockedAt?.ToString("o")}");
                    }
                }

                // Redirect to frontend with success
                return Redirect("http://localhost:5173/?login=success");
            }

            // If external login is not registered, create a new user
            var email = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            if (email == null)
            {
                return Redirect("http://localhost:5173/login?error=email_not_provided");
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new User
                {
                    UserName = email,
                    Email = email,
                    FullName = name ?? email,
                    RegistrationTime = DateTime.UtcNow,
                    EmailConfirmed = true, // Auto-confirm email for Google users
                    IsOAuthUser = true // Marcar como usuario OAuth
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return Redirect("http://localhost:5173/login?error=user_creation_failed");
                }
            }

            var addLoginResult = await _userManager.AddLoginAsync(user, info);
            if (addLoginResult.Succeeded)
            {
                // Asignar rol AuthUser al nuevo usuario OAuth
                await _roleService.AssignRoleToUserAsync(user.Id, "AuthUser");

                await _signInManager.SignInAsync(user, isPersistent: false);
                _logger.LogInformation("User created an account using {Name} provider.", info.LoginProvider);

                // Redirect to frontend with success
                return Redirect("http://localhost:5173/?login=success&new_user=true");
            }

            return Redirect("http://localhost:5173/login?error=login_association_failed");
        }

        [HttpGet("login/facebook")]
        public IActionResult FacebookLogin(string returnUrl = "/")
        {
            var redirectUrl = Url.Action("FacebookCallback", "Account", new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties("Facebook", redirectUrl);
            return Challenge(properties, "Facebook");
        }

        [HttpGet("facebook-callback")]
        public async Task<IActionResult> FacebookCallback(string returnUrl = "/")
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                return Redirect("http://localhost:5173/login?error=external_login_failed");
            }

            // Attempt to sign in with external login provider
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);

            if (result.Succeeded)
            {
                _logger.LogInformation("User logged in with {Name} provider.", info.LoginProvider);
                var existingUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

                if (existingUser != null)
                {
                    var userRoles = await _roleService.GetUserRolesAsync(existingUser.Id);
                    var isBlocked = existingUser.IsBlocked;
                    var blockedAt = existingUser.BlockedAt;
                    
                    if (!userRoles.Contains("AuthUser"))
                    {
                        await _roleService.AssignRoleToUserAsync(existingUser.Id, "AuthUser");
                        _logger.LogInformation("Assigned AuthUser role to existing user {UserId} logged in with {Provider}.", existingUser.Id, info.LoginProvider);
                    }

                    if (!existingUser.IsOAuthUser)
                    {
                        existingUser.IsOAuthUser = true;
                        await _userManager.UpdateAsync(existingUser);
                    }
                    
                    if (isBlocked)
                    {
                        return Redirect($"http://localhost:5173/login?error=account_blocked&blockedAt={blockedAt?.ToString("o")}");
                    }
                }

                // Redirect to frontend with success
                return Redirect("http://localhost:5173/?login=success");
            }

            // If external login is not registered, create a new user
            var email = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            if (email == null)
            {
                return Redirect("http://localhost:5174/login?error=email_not_provided");
            }

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new User
                {
                    UserName = email,
                    Email = email,
                    FullName = name ?? email,
                    RegistrationTime = DateTime.UtcNow,
                    EmailConfirmed = true,
                    IsOAuthUser = true
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return Redirect("http://localhost:5173/login?error=user_creation_failed");
                }
            }

            var addLoginResult = await _userManager.AddLoginAsync(user, info);
            if (addLoginResult.Succeeded)
            {
                // Asignar rol AuthUser al nuevo usuario OAuth
                await _roleService.AssignRoleToUserAsync(user.Id, "AuthUser");

                await _signInManager.SignInAsync(user, isPersistent: false);
                _logger.LogInformation("User created an account using {Name} provider.", info.LoginProvider);

                // Redirect to frontend with success
                return Redirect("http://localhost:5173/?login=success&new_user=true");
            }

            return Redirect("http://localhost:5173/login?error=login_association_failed");
        }
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _roleService.GetUserRolesAsync(user.Id);
                userList.Add(new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    profilePictureUrl = user.ProfilePictureUrl,
                    isOAuthUser = user.IsOAuthUser,
                    isBlocked = user.IsBlocked,
                    blockedAt = user.BlockedAt,
                    roles = roles
                });
            }

            return Ok(userList);
        }

        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found", userId });
            }
            await _userManager.DeleteAsync(user);
            return Ok(new { message = "User deleted successfully", userId });
        }

        //borrar lista de usuarios
        [HttpDelete("user/DeleteUsers")]
        public async Task<IActionResult> DeleteUsers([FromBody] List<string> userIds)
        {
            var users = await _userManager.Users.Where(u => userIds.Contains(u.Id)).ToListAsync();
            if (!users.Any())
            {
                return NotFound(new { message = "No users found", userIds });
            }

            foreach (var user in users)
            {
                await _userManager.DeleteAsync(user);
            }

            return Ok(new { message = "Users deleted successfully", userIds });
        }

        // Endpoints para gestión de roles
        [HttpGet("user/{userId}/roles")]
        public async Task<IActionResult> GetUserRoles(string userId)
        {
            var roles = await _roleService.GetUserRolesAsync(userId);
            return Ok(new { userId, roles });
        }

        [HttpPost("user/{userId}/roles/{roleName}")]
        public async Task<IActionResult> AssignRole(string userId, string roleName)
        {
            await _roleService.AssignRoleToUserAsync(userId, roleName);
            return Ok(new { message = $"Role {roleName} assigned to user {userId}" });
        }

        [HttpDelete("user/{userId}/roles/{roleName}")]
        public async Task<IActionResult> RemoveRole(string userId, string roleName)
        {
            await _roleService.RemoveUserFromRoleAsync(userId, roleName);
            return Ok(new { message = $"Role {roleName} removed from user {userId}" });
        }

        [HttpGet("roles")]
        public IActionResult GetAvailableRoles()
        {
            var roles = new[] { "Admin", "AuthUser", "Public" };
            return Ok(roles);
        }
        
        
        // Endpoints para bloquear/desbloquear usuarios
        [HttpPost("user/{userId}/block")]
        public async Task<IActionResult> BlockUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found", userId });
            }

            user.IsBlocked = true;
            user.BlockedAt = DateTime.UtcNow;
            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                _logger.LogInformation("User {UserId} has been blocked", userId);
                return Ok(new { message = "User blocked successfully", userId, blockedAt = user.BlockedAt });
            }

            return BadRequest(new { message = "Failed to block user", errors = result.Errors });
        }

        [HttpPost("user/{userId}/unblock")]
        public async Task<IActionResult> UnblockUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found", userId });
            }

            user.IsBlocked = false;
            user.BlockedAt = null;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                _logger.LogInformation("User {UserId} has been unblocked", userId);
                return Ok(new { message = "User unblocked successfully", userId });
            }

            return BadRequest(new { message = "Failed to unblock user", errors = result.Errors });
        }

        [HttpPost("users/block")]
        public async Task<IActionResult> BlockUsers([FromBody] BlockUsersRequest request)
        {
            var users = await _userManager.Users.Where(u => request.UserIds.Contains(u.Id)).ToListAsync();
            if (!users.Any())
            {
                return NotFound(new { message = "No users found", userIds = request.UserIds });
            }

            var blockedCount = 0;
            foreach (var user in users)
            {
                user.IsBlocked = true;
                user.BlockedAt = DateTime.UtcNow;
                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    blockedCount++;
                }
            }

            _logger.LogInformation("{BlockedCount} users have been blocked.", blockedCount);
            return Ok(new { message = $"{blockedCount} users blocked successfully", blockedCount, userIds = request.UserIds });
        }

        [HttpPost("users/unblock")]
        public async Task<IActionResult> UnblockUsers([FromBody] List<string> userIds)
        {
            var users = await _userManager.Users.Where(u => userIds.Contains(u.Id)).ToListAsync();
            if (!users.Any())
            {
                return NotFound(new { message = "No users found", userIds });
            }

            var unblockedCount = 0;
            foreach (var user in users)
            {
                user.IsBlocked = false;
                user.BlockedAt = null;
                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    unblockedCount++;
                }
            }

            _logger.LogInformation("{UnblockedCount} users have been unblocked", unblockedCount);
            return Ok(new { message = $"{unblockedCount} users unblocked successfully", unblockedCount, userIds });
        }
    }

    
    public class BlockUsersRequest
    {
        public List<string> UserIds { get; set; } = new();
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; } = false;
    }
}