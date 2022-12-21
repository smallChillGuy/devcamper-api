const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async(req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }


  // Make sure token exist 
  if (!token) {
    let errMsg = `Not authorize`;
    return next(new errorResponse(errMsg, 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);
    next();

  } catch (err) {
    let errMsg = `Not authorize`;
    return next(new errorResponse(errMsg, 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      let errMsg =`User role ${req.user.role} is not unauthorized`;
      return next(new errorResponse(errMsg, 403));
    }
    next();
  }
};
