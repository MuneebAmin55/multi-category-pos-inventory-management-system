/**
 * @file middlewares/upload.middleware.js
 * @description Multer upload middleware wrapper with error handling for single image uploads.
 */

const multer = require('multer');
const { upload } = require('../config/multer.config');
const ApiError = require('../utils/apiError');

const uploadSingleImage = (fieldName = 'image') => {
  const multerMiddleware = upload.single(fieldName);

  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File too large. Maximum allowed size is 5MB.'));
        }
        return next(ApiError.badRequest(`File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingleImage,
};
