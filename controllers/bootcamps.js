const path = require('path');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require("../models/Bootcamps");

// @desc -> GET all bootcamps
// @route -> GET /api/v1/bootcamps
// @access -> Public
exports.getBootcamps =asyncHandler (async (req, res, next) => {
  res.status(200).json(res.advanceResults);
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
  // Add user to request to body
  req.body.user = req.user._id;
  console.log(req.body);

  // Check for published bootcamp
  const publishedBootcamp = 
    await Bootcamp.findOne({ user: req.user.id });
  console.log(publishedBootcamp);

  // If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
      let errMsg =
	`This User with ID ${req.user.id} has already published`;
      return next(new ErrorResponse(errMsg, 400));
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp});
});

// @desc -> Update bootcamp
// @route -> PUT /api/v1/bootcamps/:id
// @access -> Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  let bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    let errMsg = `Bootcamp not found with id of ${req.params.id}`;
    return next(new ErrorResponse(errMsg, 404));
  }

  // Make sure is bootcamp owner
  const isOwner = bootcamp.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    let errMsg = `User ${req.user.id} is not authorized for this.`;
    return next(new ErrorResponse(errMsg, 401));
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
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
  
    // Make sure is bootcamp owner
    const isOwner = bootcamp.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      let errMsg = `User ${req.user.id} is not authorized for this.`;
      return next(new ErrorResponse(errMsg, 401));
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

  // Make sure is bootcamp owner
  const isOwner = bootcamp.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    let errMsg = `User ${req.user.id} is not authorized for this.`;
    return next(new ErrorResponse(errMsg, 401));
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

