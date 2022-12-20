const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamps");

// @desc -> GET courses 
// @route -> GET /api/v1/bootcamps/:bootcampId/courses
// @route -> GET /api/v1/courses
// @access -> Public
exports.getCourses = asyncHandler(async(req, res, next) => {
  if (req.params.bootcampsId) {
    // GET /api/v1/bootcamps/:bootcampId/courses
    const courses =await Course.find({ bootcamp: req.params.bootcampsId });
    
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    // GET /api/v1/courses
    res.status(200).json(res.advanceResults);
  }
});

// @desc -> GET single Course 
// @route -> GET /api/v1/courses/:id
// @access -> Public
exports.getCourse = asyncHandler(async(req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    let errMsg = `Course not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }
  res.status(200).json({ success: true, data: course });
});

// @desc -> Create new Course 
// @route -> POST /api/v1/bootcamps/:bootcampId/courses
// @access -> Private
exports.addCourse =asyncHandler( async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp) {
    let errMsg = `Bootcamp not found with id of ${req.params.bootcampId}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  // Make sure is bootcamp owner
  const isOwner = bootcamp.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    let errMsg = `User ${req.user.id} not authorized to add course.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc -> Update  course
// @route -> PUT /api/v1/courses/:id
// @access -> Private
exports.updateCourse = asyncHandler(async(req, res, next) => {
  let course = await Course.findById(req.params.id);

  if(!course) {
    let errMsg = `Course not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  // Make sure is bootcamp owner
  const isOwner = course.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    let errMsg = `User ${req.user.id} not authorized to update course.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc -> Delete bootcamp
// @route -> DELETE /api/v1/courses/:id
// @access -> Private
exports.deleteCourse = asyncHandler(async(req, res, next) => {
  const course = await Course.findById(req.params.id);

  if(!course) {
    let errMsg = `Course not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  // Make sure is bootcamp owner
  const isOwner = course.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    let errMsg = `User ${req.user.id} not authorized to delete course.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });

});
