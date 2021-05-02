const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');


//First we will create a schema which will help us to make a model
// new  mongoose.Schema will specify a chema for our data
const tourSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum:{
            values: ['easy','medium','difficult'],
            message: 'Difficulty can be only easy,medium or difficulty'
        } 
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1,'Rating must be above 1.0'],
        max: [5,'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price : {
        type : Number,
        required : [true,'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                 // this only points to current doc on NEW document creation ,means only when created not during updation
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'

        }
       
        
    },
    summary: {
        type: String,
        trim: true, //To remove white spaces
        required: [true, 'A tour must have a description'] //as it will too be in overview page
      },
    description: {
        type: String,
        trim: true
    },
    imageCover: {//we simply leave the images in the file system and then put the name of the images itself in the database as a field
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],//an array of strings
    createdAt: {//A timestamp that is set by the time the user gets a new tour
        type: Date,
        default: Date.now(), //gives the current time in millisecond
        select: false //if we want to hide ot publically
    },
    startDates: [Date], //diff dates at which a tour starts,i.e diff dates for the same tour or 
    //can be said as the instances of the tour starting on different dates
    secretTour: {
        type: Boolean,
        default: false
    },

    startLocation: {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point'] //only point 
          },
          coordinates: [Number], //longitude first and then latitude
          address: String,
          description: String,
          day: Number  //day of the tour
        }
    ],
    //To implement child referencing, we’ll update our tour schema in a special way
   
    guides: [
      {
        type: mongoose.Schema.ObjectId,//expecting a mongoDB ID
        ref: 'User'
      }
    ]

},
{
    toJSON: { virtuals : true},
    toObject: { virtuals : true}
});
//Virtual properties are fields on a document that will not be stored in the database
//we’ll create a durationWeeks property derived from our duration (in days) property

//After specifying the property name in the virtual() method, we the chain an Express get() method and
// pass in a function that handles the calculation we want.
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});//We have to use get() because this property is only created when a GET request is made. 
//Note that we can’t use an arrow function here because arrow functions use lexical this binding.
// We don’t want that; we want this to point to the document in question when the function is called.
//This is done here not in the controllers as the schema has to follow MVC architecture and keep business logic as much in the model as possible.

//---- Virtual populate------to get info about reviews when searching a tour,as it is done via parent ref.,thus tour(parent) does not have any info abot (reviews)
//This feature will allow us to populate the tour with reviews without actually persisting an array of review IDs on the tour document. We begin by writing this method onto our tour model:

tourSchema.virtual('reviews', {
  ref: 'Review',//ref is the name of the model we want to reference
  foreignField: 'tour', //foreignField is the name of the field in the Review model that contains the reference to the current model (the tour model).
  localField: '_id' //localField is the name of the field where the ID is stored on the current model.
});



//We can define functions in Mongoose to run before or after certain events,
// like saving a new document.

//--------------//-----------//----------------
//Document Middleware: ****runs before .save() and .create()****
//(can actually work for remove and validate also)

tourSchema.pre('save', function(next) {//here save is the hook
    this.slug = slugify(this.name, { lower: true });//this points to the current document being saved.
    next();//Now, we’ll use this function to create a slug out of the tour’s name using the slugify package from npm.
  });// We’ll also give our middleware access to the next() function so that we don’t run into any problems when we add more middleware.


//QUERY MIDDLEWARE
//regex is used for all the query which have find in it...like find(),findOne(),findOneAndRemove().

tourSchema.pre(/^find/, function(next) {//The difference is that the hook is now 'find' (for the find() method) instead of 'save':
    
    this.find({ secretTour: { $ne: true } });//this points to the current query, to which we’re chaining another find() method before its execution. 
  //simply shows only those tours publicly which have secret tour ->false
    this.start = Date.now();
    next();
  });

tourSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'//we probably have some fields, like passwordChangedAt
    });
  
    next();
  });
  
tourSchema.post(/^find/, function(docs, next) {
    
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
  });

  //Aggregation Middleware
  //Let’s say we also wanted to exclude our secret tour from any of our aggregations.
  // Rater than add a new $match stage to each of our aggregations, we’ll add this middleware

  tourSchema.pre('aggregate', function(next) {
    
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });//we are adding one more filter here in terms of secret tour,
    //we are using unshift as we have to insert in the begining of the array
    next();

  });
 // Now the secret tour is excluded from all of our aggregations.



const Tour = mongoose.model('Tour' , tourSchema); 

module.exports = Tour;