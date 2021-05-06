// main things to add review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
      review: {
        type: String,
        required: [true, 'Review can not be empty!']
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      tour: {//parent ref to tour
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
      },
      user: {//parent ref to user
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
      }
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
);


reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});


reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([//"this" points to the current model in static method and we want to call aggerate directly on model thus static is used
    //forming aggregate pipeline
    {
      $match: { tour: tourId } //selecting tour via id which we want to update
    },
    {
      $group: {
        _id: '$tour', //grouping all tours together by tour
        nRating: { $sum: 1 }, //will give number of rating for current tour
        avgRating: { $avg: '$rating' } //each review doc has a "rating" field and we will calculate rating from there
      }
    }
  ]);


  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {//if no review remaining then set default!!
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {//we are using "post" instead of "pre"  in save because we can’t perform our calculations until the document is in the database.
 
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);///above function called as a middleware
  //this.constructor, will point to the model that created the document
});

// findByIdAndUpdate
// findByIdAndDelete // neither findByIdAndUpdate norfindByIdAndDelete have access to document middleware
//They only get access to query middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); //this will point to the current query, not the current review
  //Therefore, to access the review, we’ll need to execute the query:
 
  next();
});
//---Very Important--//If we want to run our calculations with the most current data, we’ll need a post() middleware, not pre().
// But if use post(), we won’t have access to our query, since it will already have executed.
// The solution is to turn our r variable into a property(by this.r), which we can then access in a post() middleware:


reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);

  // r points a review. We’ll need access to the review model to get calcAverageRatings, so we write this.r.constructor.calcAverageRatings().
  // Then, we pass in the tour ID located on that review
  // And we’re done! Our ratings information will now automatically update upon review creation, edit, and deletion.

}); 
const Review = mongoose.model('Review', reviewSchema); //creating a model

module.exports = Review; //exporting the model