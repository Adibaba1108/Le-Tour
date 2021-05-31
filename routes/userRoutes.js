const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

//We’ll then create a signup route in our user routes file
//We’ve made a separate endpoint for sign-ups because we’d never GET or PATCH data for a sign-up.
//It doesn’t really fit into REST architecture.
router.post('/signup',authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


// Protect all routes after this middleware
router.use(authController.protect);

router.patch(
    '/updateMyPassword',
    authController.updatePassword
);
router.get(
    '/me', 
    userController.getMe, 
    userController.getUser//from factory function get user
);

router.patch(
      '/updateMe',
       userController.updateMe
);

router.delete(
    '/deleteMe',
    userController.deleteMe
);

//All routes below can only be access by an admin!!
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);//not created pls use signup

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;

