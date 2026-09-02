import multer from 'multer';
import { ApiResponse } from '../utils/apiResponse.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only image files (JPEG, PNG, WEBP) are supported.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter
});

export const uploadTemporaryScreenshot = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return ApiResponse.error(res, 'Screenshot size exceeds 10MB limit', 'FILE_TOO_LARGE', 400);
      }
      return ApiResponse.error(res, `Upload error: ${err.message}`, 'UPLOAD_ERROR', 400);
    } else if (err) {
      return ApiResponse.error(res, err.message, err.code || 'INVALID_UPLOAD', 400);
    }

    if (!req.file) {
      return ApiResponse.error(res, 'No screenshot image file provided', 'MISSING_FILE', 400);
    }

    next();
  });
};
