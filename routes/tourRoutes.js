const express = require('express');

const router = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

//router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
  
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// app.get('/api/v1/tours' , getAllTours);
// app.post('/api/v1/tours',createTour);

//---A shorter way to write the above same thing

router
    .route('/')
    .get(
      authController.protect,
      tourController.getAllTours) //getAllTours route should be accessible only to logged-in users , to accomplish this, we’ll create a middleware and add it to that route.
    .post(tourController.createTour);
//--A Post req---///---We can see the the url remain same but only the HTTP method changed...just the way REST api works.
//--Here in post we data flows from client to server,and this data is ideally stored in req,but express put it in middleware.It is just a step that the req goes through while it's being processed.



// app.get('/api/v1/tours/:id' , getTour);
// app.patch('/api/v1/tours/:id' , updateTour);

// app.delete('/api/v1/tours/:id' , deleteTour);
//---A shorter way to write the above same thing

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(//we don’t want the average user to have the ability to delete tours. We’ll now create a middleware that restricts certain routes. Restricting our deleteTour route 
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),//admin and a lead-guide can delete a tour
      tourController.deleteTour
      );

module.exports = router;