const mongoose = require('mongoose');


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
       
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
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
const Tour = mongoose.model('Tour' , tourSchema); 

module.exports = Tour;