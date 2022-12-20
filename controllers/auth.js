const sendEmail =  require('../utils/sendEmail');
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

// @desc GET current logged in User
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async(req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
      let errMsg = `No users found.`;
      return next(new ErrorResponse(errMsg, 404));
  }

});

// @desc Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public 
exports.forgotPassword = asyncHandler(async(req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    let errMsg = `No users found.`;
    return next(new ErrorResponse(errMsg, 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the rest of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try {
    await sendEmail ({
      email: user.email,
      subject: 'Password reset token',
      message
    });
    
    res.status(200).json({ success: true, msg: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;

    await user.save({ validateBeforeSave: false });

    let errMsg = `Email could not be sent.`;
    return next(new ErrorResponse(errMsg, 500));
  }
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
