const express = require('express');

const { 
  getReviews
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });
const Review = require('../models/Review');
const advanceResults = require('../middleware/advanceResult');

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advanceResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }), getReviews)

module.exports = router;
