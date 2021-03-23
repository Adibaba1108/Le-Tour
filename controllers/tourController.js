//Importing our Tour model
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

//2]--ROUTE HANDLERS--
//A middleware which will run and here we are filling the value of limit sort and field according to the need from starting.
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  };

//---A get request---it is a handler function for our url to get all the tour
exports.getAllTours = async (req,res)=>{
    
    try{

        const features = new APIFeatures(Tour.find(), req.query)//creating an instance of APIFeatures class passing in the constructor (query obj,query string(coming from express))
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const tours = await features.query;

        //SEND RESPONSE
       
        res.status(200).json({
           status : 'success',
           results : tours.length,
           data: {
               tours : tours, //--tours on the LHS will be same as the endpoint and RHS will be same as the variable that has the json object of the file details.
           }
        });
    }catch(err){
       res.status(404).json({
        status : 'fail',
        message : err
       }); 
    }
    
};

exports.getTour = async (req,res)=>{
    
    try{
         //returns «Query»
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({_id : req.params.id})//above command can be written like this but mongoose provide us an easier method.
        
        res.status(200).json({
           status : 'success',
           data : {
               tour 
           }
        });
    }
    catch(err){
        res.status(404).json({
            status : 'fail',
            message : err
           }); 
    }
    
       
  
};

exports.createTour = async (req,res)=>{
    try{
        //Old method to create documents
        //const newTour = new Tour({})
        //newTour.save
        //save method here is available on all the instances created through a model ,i.e on all doc,Not on the model itself!!
        //mean Tour.save will give error but newTour which is an instance of the Tour,will have save method,because save is a part of the prototype object of this class


        //We imported Tour model from the tourModel file and then created a new doc with it's help
        //and named it newTour
        const newTour = await Tour.create(req.body);//Using async await becaute this Tour.create returns a promise
        
        res.status(201).json({
            status : 'success',
            data : {
                tour : newTour
            }
        });
    } catch(err){
        res.status(400).json({
            status : 'fail',
            message : err
        });

    }

    
    
};


exports.updateTour = async (req, res) => {
    try {
        //returns «Query»
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //return the modified doc rather than the original
        runValidators: true //when we update our doc,then because of setting it true the validators we set in the schema will run again.
      });
  
      res.status(200).json({
        status: 'success',
        data: {
          tour //tour:tour ,but can be written like this if property name has the same name of the value.
        }
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err
      });
    }
  };

exports.deleteTour = async (req,res)=>{
  
    try{

        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status:"success",
            data : null //data is null as that tour is deleted
        })
    }
    catch(err)
    {
        res.status(404).json({
            status: 'fail',
            message: err
          });
    }
    
};