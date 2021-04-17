const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

//We’ll then create a signup route in our user routes file
//We’ve made a separate endpoint for sign-ups because we’d never GET or PATCH data for a sign-up.
//It doesn’t really fit into REST architecture.
router.post('/signup',authController.signup);

router.post('/login', authController.login);


router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;