const express = require('express');

const router = express.Router();
const tourController = require('./../controllers/tourController');

//router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
  
// app.get('/api/v1/tours' , getAllTours);
// app.post('/api/v1/tours',createTour);

//---A shorter way to write the above same thing

router
    .route('/')
    .get(tourController.getAllTours)
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
    .delete(tourController.deleteTour);

module.exports = router;