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

  sendTokenResponse(user, 200, res);
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

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create Token
  const token = user.getSignedJwToken();
  const expireDate = process.env.JWT_COOKIE_EXPIRE

  const options = {
    expires: new Date(Date.now() + expireDate * 24 *60 *60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};

// @desc GET current logged in User
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async(req, res, next) => {
  console.log(req.hey)
  console.log(req.user)
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
