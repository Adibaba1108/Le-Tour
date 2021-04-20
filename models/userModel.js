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
    
    role: {
      type: String,
      enum: {
        values: ['user', 'guide', 'lead-guide', 'admin'],
        message: 'Role must be either user, guide, lead-guide, or admin.'
       
      },
       default: 'user' 
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false //password will not be visible in the output
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
        },
        passwordChangedAt: Date ,//only if any user model have this field means then only we will check it is changed before the token given or after
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
          type: Boolean,
          default: true,
          select: false
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

  //It is an instance method ,that we have created below,it means that it is gonna be available on all the documents of certain collection.
  userSchema.methods.correctPassword = async function(candidatePassword,userPassword) 
  {//this here points to the current doc
    return await bcrypt.compare(candidatePassword, userPassword); 
    //We cannot compare manually as the candidate password is not hashed and userPass is hashed,thus we used function-:"compare"
  };

  //Another Instance method-:
  userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {//only if any user model have this field "passwordChangedAt" means then only we will check it is changed before the token given or after
      //console.log(this.passwordChangedAt, JWTTimestamp)->in format -> 2021-04-18T00:00.000Z 1556804652
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10 //base 
      );
  
      return JWTTimestamp < changedTimestamp; //isued at 100 and changed at 200----> 100<200 thus true(yes changed)
    }
  
    // False means NOT changed
    return false; //isued at 200 and changed at 100----> 200<100 thus false(not changed)
  };
  

  userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    //we’ve used the built-in crypto module since these reset tokens aren’t as big of a security red flag as passwords
  // first use crypto to create a random 32-byte token

  // we hash it and save it in our database in the passwordResetToken fields
    this.passwordResetToken = crypto
      .createHash('sha256')//method used for encryption
      .update(resetToken)//string that needs to be encrypt
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;//time when this token will expire
  
    return resetToken;//we return the unhashed token, which is what we’ll send to the user,
    //it will be simple non encrypted token..as we will encrypt only those string that has to be stored in our database
  };
  

const User = mongoose.model('User' , userSchema); 

module.exports = User;