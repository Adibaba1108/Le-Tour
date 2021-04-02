const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Uncaught exceptions are like unhandled rejections, but are in synchronous code and have nothing to do with promises

//Also we have put this block of code at the top of the file before we require the app, because any bugs that come before we define this method will not be caught.
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);////A key difference from unhandled rejections is that we no longer need a callback function, as this is not asynchronous code
});

///---dotnev read this from the file and then
//saving them as environment variable in node js.

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

///These are here to deal in with some
// deprecation warnings.//This connect method will return a promise
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

//---4]START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
//Some errors might occur that never make it to our Express app, and cannot be handle by our global error handler..
//.One example is an attempt to access the database with an invalid password. This will result in an unhandled rejection
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {//process.exit() is a very abrupt way of ending the server and will kill any pending requests. We’d rather close the server first and then run process.exit().
    process.exit(1);//1 stands for “uncaught exception,” and 0 would stand for “success.”
  });
});
