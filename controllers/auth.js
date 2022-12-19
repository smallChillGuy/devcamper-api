const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const User = require("../models/User");


// @desc Register User
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async(req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Create token
  const token = user.getSignedJwToken();

  res.status(200).json({ success: true, token });
});

// @desc Login User
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async(req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    let errMsg = `Please provide an email and password.`;
    return next(new ErrorResponse(errMsg, 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    // 401 unauthorized
    let errMsg = `Invalid Credentials.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    // 401 unauthorized
    let errMsg = `Invalid Credentials.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  // Create token & Send token
  const token = user.getSignedJwToken();
  res.status(200).json({ success: true, token });
});
