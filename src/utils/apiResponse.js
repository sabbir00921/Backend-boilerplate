class apiResponse {
  constructor(message, statusCode, data) {
    this.message = message;
    this.statusCode = statusCode;
    this.status = statusCode >= 200 && statusCode < 300 ? "ok" : "Error";
    this.data = data;
  }
  static sendSucess(res, statusCode, message, data) {
    return res
      .status(statusCode)
      .json(new apiResponse(message, statusCode, data));
  }
}

module.exports = { apiResponse };
