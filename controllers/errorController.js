// //It is a kind of a handler (for errors) so we included this file inside controllers..it is nothing but our global error handler!!!

// //500 for internal sever error

// const AppError = require('./../utils/appError');


// //We only want to send the client error messages for operational errors, not programming errors
// const handleCastErrorDB = err => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = err => {
//   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; //Here we makes use of a regular expression that targets text between quotes.
//   console.log(value);

//   const message = `Duplicate field value: ${value}. Please use another value!`;
//   return new AppError(message, 400);
// };
// const handleValidationErrorDB = err => {
//   const errors = Object.values(err.errors).map(el => el.message);//This error has an errors object with objects for each wrong field
//   //We loop over each of the objects with errors buy using Object.values().
//   const message = `Invalid input data. ${errors.join('. ')}`;
//   return new AppError(message, 400);
// };

// const handleJWTError = () =>
//   new AppError('Invalid token. Please log in again!', 401);

// const handleJWTExpiredError = () =>
//   new AppError('Your token has expired! Please log in again.', 401);

// //In development we want as much information as possible
// const sendErrorDev = (err, req, res) => {
//   // A) API
//   if (req.originalUrl.startsWith('/api')) {
//     return res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack: err.stack
//     });
//   }

//   // B) RENDERED WEBSITE
//   console.error('ERROR 💥', err);
//   return res.status(err.statusCode).render('error', {
//     title: 'Something went wrong!',
//     msg: err.message
//   });
// };

// const sendErrorProd = (err, req, res) => {
//   // A) API
//   if (req.originalUrl.startsWith('/api')) {
//     // A) Operational, trusted error: send message to client
//     if (err.isOperational) {
//       return res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message
//       });
//     }
//     // B) Programming or other unknown error: don't leak error details
//     // 1) Log error
//     console.error('ERROR 💥', err);
//     // 2) Send generic message
//     return res.status(500).json({
//       status: 'error',
//       message: 'Something went very wrong!'
//     });
//   }

//   // B) RENDERED WEBSITE
//   // A) Operational, trusted error: send message to client
//   if (err.isOperational) {
//     console.log(err);
//     return res.status(err.statusCode).render('error', {
//       title: 'Something went wrong!',
//       msg: err.message
//     });
//   }
//   // B) Programming or other unknown error: don't leak error details
//   // 1) Log error
//   console.error('ERROR 💥', err);
//   // 2) Send generic message
//   return res.status(err.statusCode).render('error', {
//     title: 'Something went wrong!',
//     msg: 'Please try again later.'
//   });
// };

// module.exports = (err, req, res, next) => {//****main export start from here***

//   // console.log(err.stack);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {// In development we want as much information as possible.
//     sendErrorDev(err,req, res);
//   } else if (process.env.NODE_ENV === 'production') {//Here our client want to see clean message if error occured
//     let error = { ...err };//deconstruction  to make a hard copy
//     //If error is operational,here we have taken 3 errors as an operational errors,Since we specified an isOperational property in our AppError class , we can make use of it here...

//     error.message = err.message;

//     if (error.name === 'CastError') error = handleCastErrorDB(error);//a request with an invalid Mongo ID (e.g. 'potato')

//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);//a duplicate key error during document creation (e.g. two tours with the same name)

//     if (error.name === 'ValidationError')//  other validation errors (e.g. a tour with an average rating of 2,000),or difficulty as 'xyz'.
//       error = handleValidationErrorDB(error);

//     if (error.name === 'JsonWebTokenError') error = handleJWTError();
//     if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

//     sendErrorProd(error, req, res);
//   }
// };


const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    //These names are specific for every error and needs to be same to work
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
