using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ToryBack.Models
{
    public class User : IdentityUser
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [StringLength(200)]
        public string Address { get; set; } = string.Empty;
        
        public DateTime? DateOfBirth { get; set; }
        
        [Required]
        public DateTime RegistrationTime { get; set; } = DateTime.UtcNow;
        
        // Campos adicionales para OAuth
        public string? ProfilePictureUrl { get; set; }
        
        [StringLength(50)]
        public string? Gender { get; set; }
        
        [StringLength(100)]
        public string? Locale { get; set; }
        
        public bool IsOAuthUser { get; set; } = false;
        
        public DateTime? LastLoginTime { get; set; }
        
        // Campo para bloquear/desbloquear usuario
        public bool IsBlocked { get; set; } = false;
        
        public DateTime? BlockedAt { get; set; }
    }
}
