using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace ToryBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CloudinaryController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryController> _logger;

        public CloudinaryController(ILogger<CloudinaryController> logger, IConfiguration configuration)
        {
            _logger = logger;
            
            // Configurar Cloudinary desde appsettings.json
            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];
            
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        [HttpDelete("delete-image/{publicId}")]
        public async Task<ActionResult> DeleteImage(string publicId)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                {
                    return BadRequest("Public ID is required");
                }

                // Decodificar el public_id si viene URL encoded
                publicId = Uri.UnescapeDataString(publicId);

                _logger.LogInformation($"Attempting to delete image with public ID: {publicId}");

                var deletionParams = new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Image
                };

                var result = await _cloudinary.DestroyAsync(deletionParams);

                if (result.Result == "ok")
                {
                    _logger.LogInformation($"Successfully deleted image: {publicId}");
                    return Ok(new { message = "Image deleted successfully", publicId = publicId });
                }
                else if (result.Result == "not found")
                {
                    _logger.LogWarning($"Image not found: {publicId}");
                    return NotFound(new { message = "Image not found", publicId = publicId });
                }
                else
                {
                    _logger.LogError($"Failed to delete image: {publicId}, Result: {result.Result}");
                    return StatusCode(500, new { message = "Failed to delete image", error = result.Result });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting image with public ID: {publicId}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("validate-moderation")]
        public async Task<ActionResult> ValidateImageModeration([FromBody] ModerationRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.PublicId))
                {
                    return BadRequest("Public ID is required");
                }

                _logger.LogInformation($"Validating moderation for image: {request.PublicId}");

                // Obtener información de la imagen incluyendo moderación
                var getResourceParams = new GetResourceParams(request.PublicId)
                {
                    ResourceType = ResourceType.Image
                };

                var resource = await _cloudinary.GetResourceAsync(getResourceParams);

                if (resource?.Moderation != null && resource.Moderation.Count > 0)
                {
                    foreach (var moderationResult in resource.Moderation)
                    {
                        bool shouldDelete = false;
                        string reason = "";

                        // Verificar diferentes tipos de moderación
                        switch (moderationResult.Kind)
                        {
                            case "aws_rek":
                                if (moderationResult.Status == ModerationStatus.Rejected)
                                {
                                    shouldDelete = true;
                                    reason = "Contenido inapropiado detectado por AWS Rekognition";
                                }
                                break;
                                
                            case "webpurify":
                                if (moderationResult.Status == ModerationStatus.Rejected)
                                {
                                    shouldDelete = true;
                                    reason = "Contenido inapropiado detectado por WebPurify";
                                }
                                break;
                                
                            case "manual":
                                if (moderationResult.Status == ModerationStatus.Rejected)
                                {
                                    shouldDelete = true;
                                    reason = "Contenido rechazado en moderación manual";
                                }
                                break;
                                
                            default:
                                // Para cualquier otro tipo de moderación
                                if (moderationResult.Status == ModerationStatus.Rejected)
                                {
                                    shouldDelete = true;
                                    reason = $"Contenido rechazado por {moderationResult.Kind}";
                                }
                                break;
                        }

                        if (shouldDelete)
                        {
                            // Eliminar la imagen automáticamente
                            var deletionParams = new DeletionParams(request.PublicId);
                            await _cloudinary.DestroyAsync(deletionParams);
                            
                            _logger.LogWarning($"Image deleted due to inappropriate content: {request.PublicId} - {reason}");
                            
                            return Ok(new 
                            { 
                                deleted = true, 
                                reason = reason,
                                moderationStatus = moderationResult.Status,
                                moderationKind = moderationResult.Kind
                            });
                        }
                    }

                    // Si llegamos aquí, ninguna moderación rechazó la imagen
                    var approvedModeration = resource.Moderation[0];
                    return Ok(new 
                    { 
                        deleted = false, 
                        reason = "Imagen aprobada por todas las moderaciones",
                        moderationStatus = approvedModeration.Status,
                        moderationKind = approvedModeration.Kind,
                        totalModerations = resource.Moderation.Count
                    });
                }

                return Ok(new { deleted = false, reason = "No moderation data available" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating moderation for image: {request.PublicId}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("moderation-info/{publicId}")]
        public async Task<ActionResult> GetModerationInfo(string publicId)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                {
                    return BadRequest("Public ID is required");
                }

                publicId = Uri.UnescapeDataString(publicId);
                _logger.LogInformation($"Getting moderation info for image: {publicId}");

                var getResourceParams = new GetResourceParams(publicId)
                {
                    ResourceType = ResourceType.Image
                };

                var resource = await _cloudinary.GetResourceAsync(getResourceParams);

                if (resource?.Moderation != null && resource.Moderation.Count > 0)
                {
                    var moderationInfo = resource.Moderation.Select(m => new
                    {
                        kind = m.Kind,
                        status = m.Status.ToString(),
                        response = m.Response
                    }).ToList();

                    return Ok(new 
                    { 
                        publicId = publicId,
                        hasModerationData = true,
                        moderations = moderationInfo,
                        totalModerations = resource.Moderation.Count
                    });
                }

                return Ok(new 
                { 
                    publicId = publicId,
                    hasModerationData = false,
                    message = "No moderation data available for this image"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting moderation info for image: {publicId}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }

    public class ModerationRequest
    {
        public string PublicId { get; set; } = string.Empty;
    }
}