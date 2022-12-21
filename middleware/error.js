const colors = require("colors");
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const errMsg = `Resources not found`;
    error = new ErrorResponse(errMsg, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const errMsg = "Duplicate field value entered";
    error = new ErrorResponse(errMsg, 404);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errMsg = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(errMsg, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
