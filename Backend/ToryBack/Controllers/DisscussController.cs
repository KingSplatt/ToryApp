using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;
using ToryBack.Models.DTOs;
using Microsoft.AspNetCore.Identity;
using ToryBack.Services;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiscussController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DiscussController> _logger;
        private readonly UserManager<User> _userManager;
        private readonly IInventoryAuthorizationService _authorizationService;

        public DiscussController(ApplicationDbContext context, ILogger<DiscussController> logger, UserManager<User> userManager, IInventoryAuthorizationService authorizationService)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _authorizationService = authorizationService;
        }

        [HttpGet("{inventoryId}")]
        public async Task<IActionResult> GetDiscussPosts(int inventoryId)
        {
            var discussPosts = await _context.DiscussionPosts
                .Where(d => d.InventoryId == inventoryId)
                .ToListAsync();

            var result = discussPosts.Select(d => new DiscussDto
            {
                Id = d.Id,
                InventoryId = d.InventoryId,
                AuthorId = d.AuthorId,
                CreatedAt = d.CreatedAt,
                LikesCount = d.LikesCount
            });

            return Ok(result);
        }
    }
}