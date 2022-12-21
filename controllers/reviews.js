const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamps");

// @desc -> GET reviews 
// @route -> GET /api/v1/bootcamps/:bootcampId/reviews
// @route -> GET /api/v1/reviews
// @access -> Public
exports.getReviews = asyncHandler(async(req, res, next) => {
  if (req.params.bootcampId) {
    // GET /api/v1/bootcamps/:bootcampId/reviews
    const review = await Review.find({ bootcamp: req.params.bootcampId });
    
    return res.status(200).json({
      success: true,
      count: review.length,
      data: review 
    });
  } else {
    // GET /api/v1/reviews
    res.status(200).json(res.advanceResults);
  }
});

// @desc -> GET single review 
// @route -> GET /api/v1/reviews/:id
// @access -> Public
exports.getReview = asyncHandler(async(req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!review) {
    let errMsg = `Review not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }
  res.status(200).json({ success: true, data: review});
});

// @desc -> Create new review 
// @route -> POST /api/v1/bootcamps/:bootcampId/reviews
// @access -> Private
exports.addReview =asyncHandler( async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp) {
    let errMsg = `Bootcamp not found with id of ${req.params.bootcampId}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  if (!bootcamp) {
    let errMsg = `Not Bootcamp found with the id of ${req.parasm.bootcampId}.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review 
  });
});

// @desc -> Update Review
// @route -> PUT /api/v1/reviews/:id
// @access -> Private
exports.updateReview = asyncHandler(async(req, res, next) => {
  let review = await Review.findById(req.params.id);

  if(!review) {
    let errMsg = `Review not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  // Make sure is review owner
  const isOwner = review.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    let errMsg = `User ${req.user.id} not authorized to update review.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review 
  });
});

// @desc -> Delete review 
// @route -> DELETE /api/v1/reviews/:id
// @access -> Private
exports.deleteReview = asyncHandler(async(req, res, next) => {
  const review = await Review.findById(req.params.id);

  if(!review) {
    let errMsg = `Review not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  // Make sure is review owner or is Admin
  const isOwner = review.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    let errMsg = `User ${req.user.id} not authorized to delete review.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });

});
