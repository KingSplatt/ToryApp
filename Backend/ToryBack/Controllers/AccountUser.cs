using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using ToryBack.Models;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ILogger<AccountController> _logger;

        public AccountController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            ILogger<AccountController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
        }

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new
            {
                isAuthenticated = User.Identity?.IsAuthenticated ?? false,
                userName = User.Identity?.Name,
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
                return Ok(new
                {
                    message = "Login successful",
                    user = new
                    {
                        id = user?.Id,
                        email = user?.Email,
                        fullName = user?.FullName
                    }
                });
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
            var properties = _signInManager.ConfigureExternalAuthenticationProperties("Google", redirectUrl);
            return Challenge(properties, "Google");
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback(string returnUrl = "/")
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                return BadRequest(new { message = "Error loading external login information." });
            }

            // Attempt to sign in with external login provider
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);
            
            if (result.Succeeded)
            {
                _logger.LogInformation("User logged in with {Name} provider.", info.LoginProvider);
                var existingUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
                return Ok(new
                {
                    message = "Login successful",
                    provider = info.LoginProvider,
                    user = new
                    {
                        id = existingUser?.Id,
                        email = existingUser?.Email,
                        fullName = existingUser?.FullName
                    }
                });
            }

            // If external login is not registered, create a new user
            var email = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            if (email == null)
            {
                return BadRequest(new { message = "Email claim not received from Google." });
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
                    EmailConfirmed = true // Auto-confirm email for Google users
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return BadRequest(new { message = "Failed to create user account.", errors = createResult.Errors });
                }
            }

            var addLoginResult = await _userManager.AddLoginAsync(user, info);
            if (addLoginResult.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);
                _logger.LogInformation("User created an account using {Name} provider.", info.LoginProvider);
                
                return Ok(new
                {
                    message = "Account created and login successful",
                    provider = info.LoginProvider,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName
                    }
                });
            }

            return BadRequest(new { message = "Failed to add external login." });
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
                return BadRequest(new { message = "Error loading external login information." });
            }

            // Attempt to sign in with external login provider
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false);
            
            if (result.Succeeded)
            {
                _logger.LogInformation("User logged in with {Name} provider.", info.LoginProvider);
                var existingUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
                return Ok(new
                {
                    message = "Login successful",
                    provider = info.LoginProvider,
                    user = new
                    {
                        id = existingUser?.Id,
                        email = existingUser?.Email,
                        fullName = existingUser?.FullName
                    }
                });
            }

            // If external login is not registered, create a new user
            var email = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = info.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            if (email == null)
            {
                return BadRequest(new { message = "Email claim not received from Facebook." });
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
                    EmailConfirmed = true // Auto-confirm email for Facebook users
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return BadRequest(new { message = "Failed to create user account.", errors = createResult.Errors });
                }
            }

            var addLoginResult = await _userManager.AddLoginAsync(user, info);
            if (addLoginResult.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);
                _logger.LogInformation("User created an account using {Name} provider.", info.LoginProvider);
                
                return Ok(new
                {
                    message = "Account created and login successful",
                    provider = info.LoginProvider,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName
                    }
                });
            }

            return BadRequest(new { message = "Failed to add external login." });
        }
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