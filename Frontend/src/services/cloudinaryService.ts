import { CLOUDINARY_CONFIG } from '../config/config';

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = CLOUDINARY_CONFIG.CLOUD_NAME;
  const uploadPreset = CLOUDINARY_CONFIG.UPLOAD_PRESET;
  const uploadData = new FormData();
  uploadData.append('file', file);
  uploadData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadData
  });
  if (!res.ok) throw new Error('Error uploading image to Cloudinary');
  
  const data = await res.json();
  
  // Verificar resultado de moderacion si esta disponible
  if (data.moderation) {
    console.log('Moderation data:', data.moderation);
    
    // Verificar si la moderación básica rechazó la imagen
    if (Array.isArray(data.moderation)) {
      for (const mod of data.moderation) {
        if (mod.status === 'rejected') {
          await deleteImageFromCloudinary(data.public_id);
          throw new Error('Imagen rechazada: contenido inapropiado detectado');
        }
      }
    }
    
    // Verificar moderacion AWS Rekognition si esta disponible
    if (data.moderation.aws_rek) {
      const moderation = data.moderation.aws_rek;
      if (moderation.explicit_nudity && moderation.explicit_nudity.probability > 0.7) {
        await deleteImageFromCloudinary(data.public_id);
        throw new Error('Imagen rechazada: contenido inapropiado detectado');
      }
      if (moderation.violence && moderation.violence.probability > 0.7) {
        await deleteImageFromCloudinary(data.public_id);
        throw new Error('Imagen rechazada: contenido violento detectado');
      }
      if (moderation.suggestive && moderation.suggestive.probability > 0.8) {
        await deleteImageFromCloudinary(data.public_id);
        throw new Error('Imagen rechazada: contenido sugerente detectado');
      }
    }
  }
  
  return data.secure_url;
}

// Funcion auxiliar para eliminar imagenes rechazadas
async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    const response = await fetch(`/api/Cloudinary/delete-image/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log(`Imagen ${publicId} eliminada exitosamente por contenido inapropiado`);
    } else {
      console.error(`Error eliminando imagen ${publicId}:`, await response.text());
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error);
  }
}

// Funcion para validar moderacion de una imagen ya subida
export async function validateImageModeration(publicId: string): Promise<{deleted: boolean, reason: string}> {
  try {
    const response = await fetch('/api/Cloudinary/validate-moderation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ publicId })
    });
    
    if (response.ok) {
      const result = await response.json();
      return {
        deleted: result.deleted,
        reason: result.reason
      };
    } else {
      throw new Error(`Error validating moderation: ${response.status}`);
    }
  } catch (error) {
    console.error('Error validando moderación:', error);
    throw error;
  }
}

// Funcion para obtener información de moderacion de una imagen
export async function getModerationInfo(publicId: string): Promise<any> {
  try {
    const response = await fetch(`/api/Cloudinary/moderation-info/${encodeURIComponent(publicId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Moderation info:', result);
      return result;
    } else {
      throw new Error(`Error getting moderation info: ${response.status}`);
    }
  } catch (error) {
    console.error('Error obteniendo información de moderación:', error);
    throw error;
  }
}
