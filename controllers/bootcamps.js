const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamps')

// @desc -> GET all bootcamps
// @route -> GET /api/v1/bootcamps
// @access -> Public
exports.getBootcamps  = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find()
    res.status(200).json({
      success: true,
      data: bootcamps
    })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}

// @desc -> GET single bootcamp
// @route -> GET /api/v1/bootcamps/:id
// @access -> Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const id = req.params.id
    const bootcamp = await Bootcamp.findById(id)

    if (!bootcamp) {
      let errMsg = `Bootcamp not found with id of ${req.params.id}`
      return next(new ErrorResponse(errMsg, 404))
    }


    res.status(200).json({success: true, data: bootcamp})
  } catch (err) {
    console.log(err.cyan)
    let errMsg = `Bootcamp not found with id of ${req.params.id}`
    next(new ErrorResponse(errMsg, 404))
  }
}

// @desc -> Create new bootcamp
// @route -> POST /api/v1/bootcamps
// @access -> Private 
exports.createBootcamp = async (req, res, next) => {

  try {
    const bootcamp = await Bootcamp.create(req.body)

    res.status(201).json({
      success: true,
      data: bootcamp
    })
  } catch (err) {
    res.status(400).json({
      success: false
    })
  }
}

// @desc -> Update bootcamp
// @route -> PUT /api/v1/bootcamps/:id
// @access -> Private 
exports.updateBootcamp = async (req, res, next) => {
  try {
    const id = req.params.id
    const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    })
    // if bootcamp not exist throw an Error
    if (!bootcamp) throw Error

    // if everything is fine return the data
    res.status(200).json({ success: true, data: bootcamp })

  } catch (err) {
    res.status(400).json({ success: false })
  }

}

// @desc -> Delete bootcamp
// @route -> DELETE /api/v1/bootcamps/:id
// @access -> Private 
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const id = req.params.id
    const bootcamp = await Bootcamp.findByIdAndDelete(id)
    // if bootcamp not exist throw an Error
    if (!bootcamp) throw Error

    // if everything is fine return the data
    res.status(200).json({ success: true, data: {} })

  } catch (err) {
    res.status(400).json({ success: false })
  }
}
