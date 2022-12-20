const crypto = require('crypto');
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

// @desc  Update user password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = asyncHandler(async(req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    let errMsg = `Password is incorrect.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  user.password = req.body.newPassword;
  await user.save()

  sendTokenResponse(user, 200, res);
});

// @desc Update user details 
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
  console.log(req.user)
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true 
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update user details 
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
  console.log(req.user)
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true 
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Reset password 
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access Public 
exports.resetPassword = asyncHandler(async(req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpired: { $gt: Date.now() }
  });
   
  if (!user) {
    let errMsg = `Invalid Token`;
    return next(new ErrorResponse(errMsg, 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpired = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);

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
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
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
