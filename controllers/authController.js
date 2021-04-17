const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


const signToken = id => {
    // using jwt.sign(), which takes an ID and secret as parameters.
   // nothing fancy in secret key, but it should be at least 32 characters long
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  };
  
//   const createSendToken = (user, statusCode, res) => {
//     const token = signToken(user._id);
//     const cookieOptions = {
//       expires: new Date(
//         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true
//     };
//     if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
//     res.cookie('jwt', token, cookieOptions);
  
//     // Remove password from output
//     user.password = undefined;
  
//     res.status(statusCode).json({
//       status: 'success',
//       token,
//       data: {
//         user
//       }
//     });
//   };
  

//kind of a create tour for the user...
exports.signup = catchAsync(async (req,res, _next) =>{

//we need to be specific in the fields we ask for,thus not used req.body
//But now we can't register as an admin,we have create a new user normally and then add the role via Mongo DB compass
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
     
    const token = signToken(newUser._id);
    
    res.status(201).json({
        status: 'success',
        token,
        data:{
            user: newUser
        }
    });

    //createSendToken(newUser, 201, res);

    
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body; //done via ES6 destructuring
   
    // 1) Check if email and password exist
    
    if (!email || !password) { //sending an error by creating it first and then sending it to our global error handler
      
        return next(new AppError('Please provide email and password!', 400)); //400-:bad request  
        //return as if there is an error we should return right there only
    }

    // 2) Check if user exists && password is correct

    const user = await User.findOne({ email }).select('+password');
   //As password is not visible in output so to select it when the is an email entered exist,we have to write it with "+",to explicitly select it
    
    if (!user || !(await user.correctPassword(password, user.password))) {//We can see here that we used user.correctPass as user variable here is a user doc as we get it via querrying the user model,so we can use the instance method like that.
      
        return next(new AppError('Incorrect email or password', 401));//401 -: unauthorized
    }
  
    // 3) If everything ok, send token to client

    const token = signToken(user._id);
    
    res.status(200).json({
        status: 'success',
        token,
    });
     
    //createSendToken(user, 200, res);

  });

exports.protect = catchAsync(async(req,res,next) => {
    //Here the acess part is done in 4 steps when the user loged in the system will have to check that it is a valid user then only it will grant user's acees to all the data the user want,like getallTours.
    //Since GET requests have no request body, we have to send the token as an HTTP header.
    //To keep things consistent, the token will remain in the header for all routes. It’s convention to create header called authorization and set it to 'Bearer jsonwebtokenstringgoeshere'


    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];//split() req.headers.authorization at the space and then target the second element of the resulting array
    }

    if (!token) {
        return next(
        new AppError('You are not logged in! Please log in to get access.', 401) //401 -: unauthorized
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
        new AppError(
            'The user belonging to this token does no longer exist.',
            401
        )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
        new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;

    next();
});