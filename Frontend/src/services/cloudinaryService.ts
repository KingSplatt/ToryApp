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
  console.log('Cloudinary upload response:', data);
  return data.secure_url;
}
