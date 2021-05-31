const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

//Always anything to do reviews have to be authenticated
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),//only user can create
    reviewController.setTourUserIds,
    reviewController.createReview
);


// router
//   .route('/:id')
//   .get(reviewController.getReview)
//   .patch(reviewController.updateReview)
//   .delete(reviewController.deleteReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
);//only user and admins can change or delete review,user can delete his review...admin can delete any review if it is in bad taste overall
//guides and lead guides can only see a review.
module.exports = router;

//So suppose what about non authenticated person who wants to see the review...they can access it from get all tours routes...!!
