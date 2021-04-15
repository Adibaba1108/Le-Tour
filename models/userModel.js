const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//name,email,photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
     name: {
        type: String,
        required: [true, 'Please tell us your name!']
      },
      email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
      },
    passwordConfirm: {
        type: String,
        required: [true,'Please confirm your password'],
        validate: {
            //This only works on CREATE and SAVE
            validator: function(el) {
                return el == this.password;
            },
            meassage: 'Passwprds are not the same!!'
        }
    }

});
//this will refers to the current user
//To encrypt passwords, we’ll use the bcrypt package.
userSchema.pre('save', async function(next) {
   //if password is not modified then return to the next middleware
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12,it is used in salting the password before hashing it
    this.password = await bcrypt.hash(this.password, 12);
    //The hash method in brcypt is asynchronous by default, which we want so we don’t block the event loop. It returns a promise, so we have to use async/await
    //The cost parameter represents how much CPU bcyrpt will use to hash the password
    // Delete passwordConfirm field,here initially passwordConfirm is a require field and then we also checked it weather it was equal or not..but now we can set it to undefined.
    this.passwordConfirm = undefined;
    next();
  });

const User = mongoose.model('User' , userSchema); 

module.exports = User;