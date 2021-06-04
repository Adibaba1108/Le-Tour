const multer = require('multer');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


//The diskStorage method uses functions with callbacks to set destinations and filenames.
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');  //The first argument in cb is the error, which we’ve set to null in this case
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]; // To append the file extension, we extract everything after the slash in the MIME type (which looks like 'image/jpeg').
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); //To create a filename, we use the user ID and the current timestamp
//   }
// });
const multerStorage = multer.memoryStorage();

// It is a simple filter to check if the file is actually an image. MIME types make this easy:
const multerFilter = (req, file, cb) => { //accesing a req,file and a callback function
  //goal is simply to check an uploaded file should be an image ,as we do not want files which are not images.
  if (file.mimetype.startsWith('image')) {//will be true for all type of images jpeg,png,etc.
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
//We’ll combine the storage specification and filter into a new multer object and then export it as a middleware:
const upload = multer({
  storage: multerStorage, //described above
  fileFilter: multerFilter //described above
});

exports.uploadUserPhoto = upload.single('photo'); //single as 1 photo and  the 'photo' argument tells multer where on the request body to find the file

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
    
    //------The last step is to make sure the new file name gets persisted in our database. We’ll do this by checking if the request has a file and, if so, adding it to the request object:
    if (req.file) filteredBody.photo = req.file.filename;

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



