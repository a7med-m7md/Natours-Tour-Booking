const express = require('express')
const router = express.Router()
const authController = require('./../Controller/authController') 
const bookingController = require('../Controller/bookingController')

router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession)

router.use(authController.restrictTo('admin', 'lead-guide'))
router.route('/').get(bookingController.getAll).post(bookingController.createOne)
router.route('/:id').get(bookingController.getOne).patch(bookingController.updateOne).delete(bookingController.deleteOne)

module.exports = router