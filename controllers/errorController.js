//It is a kind of a handler (for errors) so we included this file inside controllers..it is nothing but our global error handler!!!

//500 for internal sever error

const AppError = require('./../utils/appError');


//We only want to send the client error messages for operational errors, not programming errors
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; //Here we makes use of a regular expression that targets text between quotes.
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);//This error has an errors object with objects for each wrong field
  //We loop over each of the objects with errors buy using Object.values().
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);


const sendErrorDev = (err, res) => {//In development we want as much information as possible
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {//****main export start from here***

  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {// In development we want as much information as possible.
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {//Here our client want to see clean message if error occured
    let error = { ...err };//deconstruction  to make a hard copy
    //If error is operational,here we have taken 3 errors as an operational errors,Since we specified an isOperational property in our AppError class , we can make use of it here...


    if (error.name === 'CastError') error = handleCastErrorDB(error);//a request with an invalid Mongo ID (e.g. 'potato')

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);//a duplicate key error during document creation (e.g. two tours with the same name)

    if (error.name === 'ValidationError')//  other validation errors (e.g. a tour with an average rating of 2,000),or difficulty as 'xyz'.
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
