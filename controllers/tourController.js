//Importing our Tour model
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
// const APIFeatures = require('./../utils/apiFeatures');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

//2]--ROUTE HANDLERS--
//A middleware which will run and here we are filling the value of limit sort and field according to the need from starting.
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  };

//---A get request---it is a handler function for our url to get all the tour


exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {//catchAysnc return a function, and then that function will be assigned to createTour.
//   //here all this is the funtion fn that we are passing as the argument to the catchAsyc fun
//   //that function since async/await type will return a promise,and if it catches an error it will pass it to the globalhandling middleware  
// //****passed next as an argument so that, when an error is caught, this function can proceed through the error handling middleware
//   const features = new APIFeatures(Tour.find(), req.query)//creating an instance of APIFeatures class passing in the constructor (query obj,query string(coming from express))
//   .filter()
//   .sort()
//   .limitFields()
//   .paginate();
// const tours = await features.query;

//   //SEND RESPONSE
 
//   res.status(200).json({
//      status : 'success',
//      results : tours.length,
//      data: {
//          tours : tours, //--tours on the LHS will be same as the endpoint and RHS will be same as the variable that has the json object of the file details.
//      }
//     });
//   });
//even before that---
    // try{

    //     const features = new APIFeatures(Tour.find(), req.query)//creating an instance of APIFeatures class passing in the constructor (query obj,query string(coming from express))
    //     .filter()
    //     .sort()
    //     .limitFields()
    //     .paginate();
    //   const tours = await features.query;

    //     //SEND RESPONSE
       
    //     res.status(200).json({
    //        status : 'success',
    //        results : tours.length,
    //        data: {
    //            tours : tours, //--tours on the LHS will be same as the endpoint and RHS will be same as the variable that has the json object of the file details.
    //        }
    //     });
    // }catch(err){
    //    res.status(404).json({
    //     status : 'fail',
    //     message : err
    //    }); 
    // }
    
//};

//facotry handler and adding populate argument also
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) =>{
//       //returns «Query»
//       const tour =  await Tour.findById(req.params.id).populate('reviews');
//       //Tour.findOne({_id : req.params.id})//above command can be written like this but mongoose provide us an easier method.
//       if (!tour) {//if we pass in a valid Mongo ID that happens not to exist in our database, we get a response with tour set to null
//         return next(new AppError('No tour found with that ID', 404));
//       }
    
//       res.status(200).json({
//         status: 'success',
//         data: {
//           tour
//         }
//       });
//     });

exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
    
//     //Old method to create documents
//     //const newTour = new Tour({})
//     //newTour.save
//     //save method here is available on all the instances created through a model ,i.e on all doc,Not on the model itself!!
//     //mean Tour.save will give error but newTour which is an instance of the Tour,will have save method,because save is a part of the prototype object of this class


//     //We imported Tour model from the tourModel file and then created a new doc with it's help
//     //and named it newTour
//     const newTour = await Tour.create(req.body);//Using async await becaute this Tour.create returns a promise -> //Mongoose queries are not promises. They have a .then() function for co and async/await as a convenience. However, unlike promises, calling a query's .then() can execute the query multiple times.
    
//     res.status(201).json({
//         status : 'success',
//         data : {
//             tour : newTour
//         }
//     });
  
// });

exports.updateTour = factory.updateOne(Tour); //---factory handler for updating tour

// exports.updateTour = catchAsync(async (req, res, next) => {

//     //returns «Query»
//       const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true, //return the modified doc rather than the original
//       runValidators: true //when we update our doc,then because of setting it true the validators we set in the schema will run again.
//     });
//     if (!tour) {
//       return next(new AppError('No tour found with that ID', 404));
//     }
  
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour //tour:tour ,but can be written like this if property name has the same name of the value.
//       }
//     });
    
// });


exports.deleteTour = factory.deleteOne(Tour); //we’ll make a new handler called deleteOne() in handlerFactory that takes Model as an argument and returns a generic version of deleteTour

// exports.deleteTour = catchAsync(async (req, res, next) =>  {
  
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
    
//     res.status(204).json({
//       status:"success",
//       data : null //data is null as that tour is deleted
//   });  
// });

//The Aggregation Pipeline-:Aggregation of a Mongo database 
//encompasses statistics like averages, sums, minimums, and maximums. 
//To begin using the aggregation pipeline, we’ll create a new handler:
//It is a pipeline as it will work as one,and every stages in it also works as a pipeline
exports.getTourStats = async (req, res) => {
    try {//We pass an array of objects, called stages, as an argument into the aggregate() method
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }//. The $match stage is pretty much just a filter query
        },
        {
          $group: {
            _id: { $toUpper: '$difficulty' },//if _id set to null then it will target all the documents in the collection. Thus id targets all that match the $match stage.
            numTours: { $sum: 1 },//$sum: 1 might look tricky, but it’s really just saying, “Every time a tour passes through this pipeline, add 1 to the accumulator.”
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        },
        {
          $sort: { avgPrice: 1 }//If we then want to sort these three objects in the "stats" array by average prices.
          //Here we took avgPrice as the variable name will be changed acc to grp stage.
        }
        // {
        //   $match: { _id: { $ne: 'EASY' } }//We can even repeat a stage to filter out more data
        // }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          stats
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };
//the startDates field is an array,we have the option to create a new document
// for each individual start date by using an $unwind stage
  exports.getMonthlyPlan = async (req, res) => {
    try {
      const year = req.params.year * 1; // 2021
  
      const plan = await Tour.aggregate([
        {
          $unwind: '$startDates' //Now we will get 27 results from our original 9 tours, 
          //each having one start date. 
        },
        {//The next step is to specify a year with a $match stage.
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`)
            }
          }
        },
        {// group the tours by month
          $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' }
          }
        },
        {
          $addFields: { month: '$_id' } //It’d be nice if "_id" was "month" instead
        },
        {
          $project: {
            _id: 0 //$project stage, we set the fields we want to hide to 0
          }
        },
        {
          $sort: { numTourStarts: -1 }//sort our data by numTourStarts, assigning -1 for descending
        },
        {
          $limit: 12
        }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          plan
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };
  
  