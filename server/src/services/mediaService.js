import { config } from '../config/env.js';
import { Media } from '../models/Media.js';
import { v2 as cloudinary } from 'cloudinary';

if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
  });
}

export async function uploadMedia(fileBuffer, fileMetadata, user, purpose = 'resident_evidence') {
  if (!fileBuffer) {
    const error = new Error('No file data provided.');
    error.statusCode = 400;
    throw error;
  }

  const { originalname, mimetype, size } = fileMetadata;

  // Validate format
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(mimetype)) {
    const error = new Error('Invalid file format. Only JPEG, PNG, and WebP are allowed.');
    error.statusCode = 400;
    throw error;
  }

  // Validate size (max 2MB)
  if (size > 2 * 1024 * 1024) {
    const error = new Error('Photograph exceeds the 2MB size limit.');
    error.statusCode = 413;
    throw error;
  }

  let mediaUrl = '';
  let cloudinaryPublicId = '';
  let deliveryType = purpose === 'resident_evidence' ? 'authenticated' : 'public';

  if (config.cloudinary.isConfigured) {
    // Real Cloudinary upload
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `civicsync/${purpose}`,
          type: deliveryType,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    mediaUrl = uploadResult.secure_url;
    cloudinaryPublicId = uploadResult.public_id;
  } else {
    // High-fidelity fallback when Cloudinary credentials are not configured yet
    // Generates a self-contained data URI or local demo asset path so user can test workflows without blocking
    const base64 = fileBuffer.toString('base64');
    mediaUrl = `data:${mimetype};base64,${base64}`;
    cloudinaryPublicId = `local_mock_${Date.now()}`;
  }

  const media = await Media.create({
    owner: user._id,
    purpose,
    deliveryType,
    cloudinaryPublicId,
    url: mediaUrl,
    format: mimetype.split('/')[1] || 'jpg',
    sizeBytes: size,
    state: 'ready'
  });

  return media;
}
