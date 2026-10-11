const okResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode = 400, details = null) => {
  const payload = {
    success: false,
    message,
  };

  if (details) payload.details = details;

  return res.status(statusCode).json(payload);
};

module.exports = {
  okResponse,
  errorResponse,
};
