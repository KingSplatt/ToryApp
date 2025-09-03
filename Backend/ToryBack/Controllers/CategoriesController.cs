using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;
using Microsoft.AspNetCore.Identity;
using ToryBack.Services;
using Microsoft.AspNetCore.Authorization;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CategoriesController> _logger;
        private readonly UserManager<User> _userManager;
        private readonly IInventoryAuthorizationService _authorizationService;

        public CategoriesController(ApplicationDbContext context, ILogger<CategoriesController> logger, UserManager<User> userManager, IInventoryAuthorizationService authorizationService)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _authorizationService = authorizationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();

            var result = categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDto categoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = new Category
            {
                Name = categoryDto.Name,
                Description = categoryDto.Description,
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }
    }
}