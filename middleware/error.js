const colors = require('colors')
const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }

  // Log to console for dev
  console.log(err.stack.red)

  // Mongose bad ObjectId
  if (err.name === 'CastError') {
    const errMsg = `Resources not found with id of ${err.value}`
    error = new ErrorResponse(errMsg, 404)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}

module.exports = errorHandler
