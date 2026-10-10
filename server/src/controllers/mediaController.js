import multer from 'multer';
import { uploadMedia } from '../services/mediaService.js';

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  }
});

export async function handleUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 'NO_FILE',
        message: 'No image file was uploaded.'
      });
    }

    const purpose = req.body.purpose || 'resident_evidence';
    const media = await uploadMedia(req.file.buffer, req.file, req.user, purpose);

    res.status(201).json({
      media: {
        id: media._id,
        url: media.url,
        purpose: media.purpose,
        deliveryType: media.deliveryType
      }
    });
  } catch (error) {
    next(error);
  }
}
