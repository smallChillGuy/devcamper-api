const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the review'],
    unique: true,
    trim: true,
    maxLength: [100, 'Name can not be more than 100 characters']
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
});

// Static method to get avg rating 
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([ 
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
	_id: '$bootcamp',
	averageRating: { $avg: '$rating' }
      }
    },
  ]);

  try {
   await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: Math.ceil(obj[0].averageRating)
    })
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save 
ReviewSchema.post('save',function() {
   this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove 
ReviewSchema.pre('remove',function() {
  this.constructor.getAverageRating(this.bootcamp);
});


// Prevent user from submitting more than one review for bootcamp 
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
