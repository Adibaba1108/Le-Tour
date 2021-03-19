//Importing our Tour model
const Tour = require('./../models/tourModel');

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

        //Build QUERY we won't make it await as we will need to add sort page limit,etc fields to it too.

        //1] Filtering
        const queryObj = { ...req.query };//this is done because we need to have a hard copy of the req.query object so that we can iterate through it and can delete page sort ,etc query as these won't be there in the documents and have to be applied afterwards.
        const excludeFields = ['page','sort','limit','fields']; //these fields needed to be excluded as discussed in above comment.
        excludeFields.forEach(el => delete queryObj[el]); //deleting the excludedfileds if they are present in the query and we are deleting it from the hard copy.
        
        //2] Advanced Filtering
        
        let queryStr = JSON.stringify(queryObj); //to convert the queryObj(JSON->string)//we took a let variable because we have to change it
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        //This is done because->gen syntax of writng a query->{difficulty:'easy,duration :{$gte :5}}
        //what req.query will log->{difficulty:'easy,duration :{gte :5}}...just the "$" sign is miising so we replace all the gt,gte,lt and lte with $ sign before it via regex
        let query =Tour.find(JSON.parse(queryStr));//return a query ,so can use async and await,but here we will not use await as this is not the final req,we have to add other fields also like page,limit ,etc.
        //also as Find() will retrun a query then we can and many more filtering methods that are present in the query object like done below.
       //we use let as many more function will be chaining with it.


        //3]Sorting //mongoose provide us an inbuilt function that can be easily be applied at a query object
        if(req.query.sort)
        {
            const sortBy = req.query.sort.split(',').join(' ');//As there can be multiple argument in the sort all will be separated initially by ',' and then we replace it by space and then put it the string in sort method
            query = query.sort(sortBy);
        }
        else{
            query = query.sort('-createdAt'); //if nothing is given just sort according to the tym that particular doc is created
        }

        //4]Field Limiting

        if(req.query.fields)
        {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);//select is like a projection here for eg of what we want
        }
        else{
            query.select('-__v');//all except __v field .
        }

        //PAGINATION

        const page = req.query.page*1 || 1 ;//default value as 1
        const limit = req.query.limit*1 || 100;
        const skip = (page-1) * limit;

        query = query.skip(skip).limit(limit);

        if(req.query.page)
        {
            const numTours = await Tour.countDocuments();
            if(skip>=numTours)
            {
                throw new  Error('This page does not exist!!!');
            }
        }
        //EXECUTE QUERY
        const tours = await query;

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