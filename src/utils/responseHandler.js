import { HTTP_STATUS } from '../config/constants.js';

class ResponseHandler {
  static success(res, data, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static badRequest(res, message = 'Bad Request', errors = null) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(res, message = 'Conflict') {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }
}

export default ResponseHandler;
