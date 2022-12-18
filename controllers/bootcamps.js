const path = require('path');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require("../models/Bootcamps");

// @desc -> GET all bootcamps
// @route -> GET /api/v1/bootcamps
// @access -> Public
exports.getBootcamps =asyncHandler (async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Remove fields from query
  removeFields.forEach(param => delete reqQuery[param])

  // Create query string
  let querySrt = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, ....)
  querySrt = querySrt
    .replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Bootcamp.find(JSON.parse(querySrt)).populate('courses');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.replace(/,/g, ' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.replace(/,/g, ' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);
  
  // Executing query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};

  if(endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page -1,
      limit
    };
  }

  res.status(200).json({ 
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps 
  });
});

// @desc -> GET single bootcamp
// @route -> GET /api/v1/bootcamps/:id
// @access -> Public
exports.getBootcamp =asyncHandler(async(req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
      let errMsg = `Bootcamp not found with id of ${req.params.id}`;
      return next(new ErrorResponse(errMsg, 404));
    }
    res.status(200).json({ success: true, data: bootcamp });
});

// @desc -> Create new bootcamp
// @route -> POST /api/v1/bootcamps
// @access -> Private
exports.createBootcamp =asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp });
});

// @desc -> Update bootcamp
// @route -> PUT /api/v1/bootcamps/:id
// @access -> Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bootcamp) {
      let errMsg = `Bootcamp not found with id of ${req.params.id}`;
      return next(new ErrorResponse(errMsg, 404));
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc -> Delete bootcamp
// @route -> DELETE /api/v1/bootcamps/:id
// @access -> Private
exports.deleteBootcamp =asyncHandler( async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
      let errMsg = `Bootcamp not found with id of ${req.params.id}`;
      return next(new ErrorResponse(errMsg, 404));
    }

    await bootcamp.remove();

    res.status(200).json({ success: true, data: {} });
});

// @desc -> GET bootcamp within a radius
// @route -> DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access -> Private
exports.getBootcampsInRadius=asyncHandler( async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [ [lng, lat], radius ] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

// @desc -> Upload Photo for bootcamp
// @route -> PUT /api/v1/bootcamps/:id/photo
// @access -> Private 
exports.bootcampPhotoUpload = asyncHandler(async(req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    let errMsg = `Bootcamp not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  if (!req.files) {
    let errMsg = `Please upload a file`;
    return next(new ErrorResponse(errMsg, 400));
  }

  const file = req.files.file;

  // Make sure is a photo
  if(!file.mimetype.startsWith('image')){
    let errMsg = `Please upload an image file`;
    return next(new ErrorResponse(errMsg, 400));
  }

  // Check max file size
  if(file.size > process.env.MAX_FILE_UPLOAD) {
    let errMsg = `Your image size must be less than ${process.env.MAX_FILE_UPLOAD}`;
    return next(new ErrorResponse(errMsg, 400));
  }

  // Create custom file name
  file.name = `image_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err)
      let errMsg = `Problem with file upload`;
      return next(new ErrorResponse(errMsg, 500));
    }

    // uploading file to the database
    await Bootcamp.findByIdAndUpdate(id, { photo: file.name });

    res.status(200).json({ success: true, data: file.name });
  });
});

// @desc -> Create new bootcamp
// @route -> POST /api/v1/bootcamps
// @access -> Private
exports.createBootcamp =asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp });
});
