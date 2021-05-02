const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//filtering from the object user send to change and selecting only allowedFields frm them storing it in the newObj and then returning that object. 
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
///-------Route Handlers for users---

exports.getMe = (req, res, next) => {//current user can get his/her information if logged in!!
  req.params.id = req.user.id;
  next();
};

// create a handler that allows the user to update their email and/or name.(but not rest like password or role)
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }
  
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
  
    // 3) Update user document
    //As we’re finally done with passwords, we can simply use findByIdAndUpdate()
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  });

//If logged in user wants to delete his/her account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  console.log(req.user);
  res.status(204).json({
    status: 'success',
    data: null
  });
});


exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};


//factory handler for user

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do NOT update passwords with this! as this route is only for admins
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User); //can be don by admin only



