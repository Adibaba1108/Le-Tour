const mongoose = require('mongoose'); 

const bookingSchema = new mongoose.Schema({
//We have a parent ref here...so keeping ref of tour and the user who booked the tour
  tour: {//parent ref to tour
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {//parent ref to user
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {//keeping price of the booked tour...as the price can change in future
    type: Number,
    require: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true // by default true as we have only stripe payment but in future it could have some different booking method also..or even cash
  }
});
//populating the tour and user automatically whenever there is a querry
bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
