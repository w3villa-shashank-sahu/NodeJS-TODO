export function sendResponse(res, code, message, data, success) {
  const response = {
    message: message,
    data: data,
    code: code,
    success: success,
  };
  res.status(code).json(response);
}

export function sendSuccess(res, code = 200, message, data = {}) {
  sendResponse(res, code, message, data, true);
}


export function sendError(res, code = 500, message, errorDetails = {}) {
  sendResponse(res, code, message, errorDetails, false);
}
