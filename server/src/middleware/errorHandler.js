import crypto from 'crypto';

export function errorHandler(err, req, res, _next) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  console.error(`[Error] [Req: ${requestId}] ${err.stack || err.message}`);

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const fieldErrors = {};
    for (const [field, error] of Object.entries(err.errors)) {
      fieldErrors[field] = error.message;
    }
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data.',
      fieldErrors,
      requestId
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: `Invalid format for identifier '${err.path}'.`,
      requestId
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      code: 'DUPLICATE_KEY',
      message: `A record with this ${field} already exists.`,
      requestId
    });
  }

  // Handle Multer upload limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Uploaded photograph exceeds the maximum allowed size (2MB).',
      requestId
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      code: 'TOO_MANY_FILES',
      message: 'You can upload a maximum of 3 photographs.',
      requestId
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.',
    requestId
  });
}
