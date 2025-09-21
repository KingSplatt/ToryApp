using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;
using System.Security.Claims;
using ToryBack.Models.DTOs;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DiscussionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DiscussionController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Discussion/inventory/{inventoryId}
        [HttpGet("inventory/{inventoryId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetDiscussionPosts(int inventoryId)
        {
            var posts = await _context.DiscussionPosts
                .Where(p => p.InventoryId == inventoryId)
                .Include(p => p.Author)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.InventoryId,
                    p.Content,
                    p.CreatedAt,
                    p.LikesCount,
                    Author = new
                    {
                        p.Author.Id,
                        p.Author.UserName,
                        p.Author.Email
                    },
                    IsLikedByCurrentUser = p.Likes.Any(l => l.UserId == User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
                })
                .ToListAsync();

            return Ok(posts);
        }

        // GET: api/Discussion/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetDiscussionPost(int id)
        {
            var post = await _context.DiscussionPosts
                .Include(p => p.Author)
                .Include(p => p.Likes)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.InventoryId,
                    p.Content,
                    p.CreatedAt,
                    p.LikesCount,
                    Author = new
                    {
                        p.Author.Id,
                        p.Author.UserName,
                        p.Author.Email
                    },
                    IsLikedByCurrentUser = p.Likes.Any(l => l.UserId == User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
                })
                .FirstOrDefaultAsync();

            if (post == null)
            {
                return NotFound();
            }

            return Ok(post);
        }

        // POST: api/Discussion
        [HttpPost]
        public async Task<ActionResult<DiscussionPost>> CreateDiscussionPost(CreateDiscussionPostDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            // Verificar que el inventario existe y el usuario tiene acceso
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.Id == dto.InventoryId);

            if (inventory == null)
            {
                return BadRequest("Inventory not found");
            }

            var post = new DiscussionPost
            {
                InventoryId = dto.InventoryId,
                AuthorId = userId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.DiscussionPosts.Add(post);
            await _context.SaveChangesAsync();

            // Cargar el autor para la respuesta
            await _context.Entry(post)
                .Reference(p => p.Author)
                .LoadAsync();

            // Devolver una respuesta limpia sin referencias circulares
            var responseData = new
            {
                post.Id,
                post.InventoryId,
                post.Content,
                post.CreatedAt,
                post.LikesCount,
                Author = new
                {
                    post.Author.Id,
                    post.Author.UserName,
                    post.Author.Email
                },
                IsLikedByCurrentUser = false // Nuevo post, no puede estar liked
            };

            return CreatedAtAction(nameof(GetDiscussionPost), new { id = post.Id }, responseData);
        }

        // PUT: api/Discussion/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDiscussionPost(int id, UpdateDiscussionPostDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var post = await _context.DiscussionPosts.FindAsync(id);
            if (post == null)
            {
                return NotFound();
            }

            // Solo el autor puede editar su post
            if (post.AuthorId != userId)
            {
                return Forbid();
            }

            post.Content = dto.Content;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Discussion/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiscussionPost(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var post = await _context.DiscussionPosts.FindAsync(id);
            if (post == null)
            {
                return NotFound();
            }

            // Solo el autor puede eliminar su post
            if (post.AuthorId != userId)
            {
                return Forbid();
            }

            _context.DiscussionPosts.Remove(post);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Discussion/{id}/like
        [HttpPost("{id}/like")]
        public async Task<IActionResult> ToggleLike(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var post = await _context.DiscussionPosts
                .Include(p => p.Likes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
            {
                return NotFound();
            }

            var existingLike = post.Likes.FirstOrDefault(l => l.UserId == userId);

            if (existingLike != null)
            {
                // Unlike: remover el like
                _context.PostLikes.Remove(existingLike);
                post.LikesCount--;
            }
            else
            {
                // Like: agregar el like
                var like = new PostLike
                {
                    UserId = userId,
                    PostId = id,
                    CreatedAt = DateTime.UtcNow
                };
                _context.PostLikes.Add(like);
                post.LikesCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new { LikesCount = post.LikesCount, IsLiked = existingLike == null });
        }
    }
}