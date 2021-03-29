//---Everything related to express and the middleware /////

const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); //this will add a bunch of method in our app variable.

//1]---Middleware used here----
if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));
}

app.use(express.json());//middleware is used here like this.

//----Static content is any content that can be delivered to an end user without having to be 
//generated, modified, or processed. The server delivers the same file to each user, making static content one of the simplest and most
// efficient content types to transmit over the Internet.
app.use(express.static(`${__dirname}/public`));


//----adding another middleware----
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();//--just adding time at which request is made and storing it in the inbuilt method of req
    next();
})


//---3]ROUTES---


///---Mounting the routers---- via Using middlewares---///
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//--middleware for handling unhandled routes--//
app.all( '*' ,(req,res,next) => {//The all() method encompasses all types of requests, including GET and PATCH, 
    //and the asterisk accepts any URL
    res.status(404).json({//Now we define a middleware that sends a JSend response.
        status : 'fail',
        message : `Can't find ${req.originalUrl} on this server!!` 
    });
}); 
module.exports = app;
