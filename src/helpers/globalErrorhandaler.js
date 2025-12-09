const developementError = (error, res) => {
  return res.status(error?.statusCode || 500).json({
    message: error.message,
    status: error.status,
    statusCode: error.statusCode,
    isOperationalError: error.isOperationalError,
    data: error.data,
    stack: error.stack,
  });
};

const productionError = (error, res) => {
  if (!error.isOperationalError) {
    return res.status(error.statusCode || 500).json({
      success: false,
      status: error.status,
      message: error.message,
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
exports.globalErrorhandaler = (error, req, res, next) => {
  if (process.env.NODE_ENV == "development") {
    developementError(error, res);
  } else {
    productionError(error, res);
  }
};
