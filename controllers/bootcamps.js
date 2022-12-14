const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const Bootcamp = require("../models/Bootcamps");

// @desc -> GET all bootcamps
// @route -> GET /api/v1/bootcamps
// @access -> Public
exports.getBootcamps =asyncHandler (async (req, res, next) => {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({ success: true, data: bootcamps });
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
    const bootcamp = await Bootcamp.findByIdAndDelete(id);

    if (!bootcamp) {
      let errMsg = `Bootcamp not found with id of ${req.params.id}`;
      return next(new ErrorResponse(errMsg, 404));
    }

    res.status(200).json({ success: true, data: {} });
});
