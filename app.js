//---Everything related to express and the middleware /////

const express = require('express');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); //this will add a bunch of method in our app variable.

//1]--- GLOBAL MIDDLEWARES----

// Set security HTTP headers
// app.use(helmet());

// // Development logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Limit requests from same API
// // It will help prevent DOS attacks and brute force attacks
// const limiter = rateLimit({
//     max: 100, 
//     windowMs: 60 * 60 * 1000, //time window --100 req per hr here--if our app restarted then it will reset the remaining to 100
//     message: 'Too many requests from this IP, please try again in an hour!'
//   });
// app.use('/api', limiter);//we’ll apply it to all the routes that start with /api.

// // ---Body parser, reading data from body into req.body---
// app.use(express.json({ limit: '10kb' }));

// // Serving static files

// //----Static content is any content that can be delivered to an end user without having to be 
// //generated, modified, or processed. The server delivers the same file to each user, making static content one of the simplest and most
// // efficient content types to transmit over the Internet.
// app.use(express.static(`${__dirname}/public`));


// //----Test middleware----
// app.use((req,res,next)=>{
//     req.requestTime = new Date().toISOString();//--just adding time at which request is made and storing it in the inbuilt method of req
//     //console.log(req.headers);
//     next();
// })


//---3]ROUTES---


///---Mounting the routers---- via Using middlewares---///
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//--middleware for handling unhandled routes--//
app.all( '*' ,(req,res,next) => {//The all() method encompasses all types of requests, including GET and PATCH, 
    //and the asterisk accepts any URL


    next(new AppError(`Can't find ${req.originalUrl} on this server!!`,404));  //passing the error in the next,
    //so whenever we passes anything in next express will know there is an error and will skip all the middlewares in between and send it to global error handling middleware.

}); 

app.use(globalErrorHandler);
module.exports = app;
