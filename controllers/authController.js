const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

//kind of a create tour for the user...
exports.signup = catchAsync(async(req,res,next) =>{

//we need to be specific in the fields we ask for,thus not used req.body
//But now we can't register as an admin,we have create a new user normally and then add the role via Mongo DB compass
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    // using jwt.sign(), which takes an ID and secret as parameters.
   // nothing fancy in secret key, but it should be at least 32 characters long
    const token = jwt.sign({id: newUser._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    
  
    res.status(201).json({
        status: 'success',
        token,
        data:{
            user: newUser
        }
    });
});