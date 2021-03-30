module.exports = fn => {//fn is nothing but the fun(everything inside getalltours,createtours...etc)
    return (req, res, next) => {// return a function, and then that function will be assigned to createTour,getalltours,etc...
        //console.log('hiye!!');
        fn(req, res, next).catch( err => next(err));//we can simplify err => next(err) to just next because next() will automatically be called with the parameter its callback receives.
    //async/await function return promises, which throw error if they can’t resolve.
    // We can catch that error using a catch method rather than a try/catch block

    };
  };
  