/**
 * @file utils/apiResponse.js
 * @description Standardized API JSON response builder.
 */

const HTTP_STATUS = require('../constants/httpStatus.constant');

class ApiResponse {
  constructor(statusCode, message = 'Success', data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (meta !== null) {
      this.meta = meta;
    }
  }

  static success(res, message = 'Success', data = null, meta = null, statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data, meta));
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return res
      .status(HTTP_STATUS.CREATED)
      .json(new ApiResponse(HTTP_STATUS.CREATED, message, data));
  }
}

module.exports = ApiResponse;
