const express = require('express')
const viewController = require('../Controller/viewController')
const router = express.Router()
const authController = require('../Controller/authController')
const bookingController = require('../Controller/bookingController')

router.get("/me", authController.protect, viewController.getUserData)
router.get("/my-tours", authController.protect, viewController.getMyTours)
// router.post("/update-user-data", authController.protect, viewController.updateUserData)

router.use(authController.isLoggedIn)
router.get("/", bookingController.createBookingCheckout, viewController.getOverview)
router.get("/tour/:slug", viewController.getTour)
router.get("/login", viewController.login)

module.exports = router