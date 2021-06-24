const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);//here we are passing the secret key and eventually it will generate a stripe object
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);//getting tour via tour id that we have in the req param
  //console.log(tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    //Info about session

    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      req.params.tourId  
    }&user=${req.user.id}&price=${tour.price}`,//if our payment is successful then sent the user to the home page,also as a temporary soln we are passing tour,user and price info in the success url querry 
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,//if user cancel the payment option.then sent it to the tour page.
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,  //to get a new booking we required a userID,tourID and price...here we specify the tour id
    //Info about the product

    line_items: [ 
      {//all these field name comes with stripe..so we have to keep it same else we will get an error
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'inr',
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;
 //if all these 3 are specified only then create a new booking,else go to the next middleware.
 //as we will go to the home page whenever success is there,thus next() will be in the view routes--see view routes middleware order for '/' this routes
  if (!tour && !user && !price) return next(); 
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);//so to make it a bit secure we will be sending the user after successful booking to the home page and removing the querry string(all important info)
 
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
