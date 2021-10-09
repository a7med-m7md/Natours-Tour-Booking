const express = require('express')
const tourController = require('../Controller/tourController')
const authController = require('../Controller/authController')
const reviewRouter = require('./reviewRouter')

const router = express.Router()


// It is better than what happening below because we don't repeat our code
// I use separation of concerns principle by using this middleware
router.use('/:tourId/review', reviewRouter)

router.route("/top-5-cheap").get(tourController.aliasTopTour, tourController.getAllTours)
router.route("/tour-stats").get(tourController.getTourStats)
router.route("/monthly-plan/:year").get(authController.protect, 
                                        authController.restrictTo('admin', 'lead-guide', 'gudie'), 
                                        tourController.getMonthlyPlan)
router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(tourController.getToursWithin)
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances)

router.route("/")
      .get(tourController.getAllTours)
      .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

router.route("/:id")
      .get(tourController.getTour)
      .patch(authController.protect, 
            authController.restrictTo('admin', 'lead-guide'), 
            tourController.uploadTourImages, 
            tourController.resizeTourImages, 
            tourController.updateTour)
      .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

// Nested Router
// POST /tours/123521313/reviews
// GET /tours/123521313/reviews
// GET  /tours/123521313/reviews/123521

// router.route("/:tourId/reviews")
//       .post(authController.protect, 
//             authController.restrictTo('user'), 
//             reviewController.createTour)

module.exports = router