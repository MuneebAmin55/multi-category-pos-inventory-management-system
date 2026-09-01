/**
 * @file config/multer.config.js
 * @description Multer disk storage and file validation configuration for product images.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/apiError');

const uploadDir = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// File filter validation (only images allowed)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = (
    process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/jpg'
  ).split(',');

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(`Invalid file type. Allowed formats: ${allowedMimeTypes.join(', ')}`),
      false
    );
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // Default: 5MB

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});

module.exports = {
  upload,
  uploadDir,
};
