const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const Course = require("../models/Course");

// @desc -> GET courses 
// @route -> GET /api/v1/bootcamps/:bootcampsId/courses
// @route -> GET /api/v1/courses
// @access -> Public
exports.getCourses = asyncHandler(async(req, res, next) => {
  let query;

  if (req.params.bootcampsId) {
    // GET /api/v1/bootcamps/:bootcampsId/courses
    query = Course.find({ bootcamp: req.params.bootcampsId });
  } else {
    // GET /api/v1/courses
    query = Course.find();
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc -> GET single bootcamp
// @route -> GET /api/v1/bootcamps/:id
// @access -> Public

// @desc -> Create new bootcamp
// @route -> POST /api/v1/bootcamps
// @access -> Private

// @desc -> Update bootcamp
// @route -> PUT /api/v1/bootcamps/:id
// @access -> Private

// @desc -> Delete bootcamp
// @route -> DELETE /api/v1/bootcamps/:id
// @access -> Private

// @desc -> GET bootcamp within a radius
// @route -> DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access -> Private

