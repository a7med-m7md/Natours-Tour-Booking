const express = require('express')
const userController = require('../Controller/userController')
const authController = require('./../Controller/authController')

const router = express.Router()

router.post("/forgotPassword", authController.forgotPassword)
router.patch("/resetPassword/:token", authController.resetPassword)
router.route("/signup").post(authController.signup)
router.route("/login").post(authController.login)
router.route("/logout").get(authController.logout)

router.use(authController.protect)
router.patch("/updatePassword", authController.updatePassword)
router.patch("/updateMe", userController.uploadUserImage, userController.resizeUserImage, userController.updateMe)
router.delete("/deleteMe", userController.deleteMe)
router.get("/me", userController.getMe, userController.getUser)

router.use(authController.restrictTo('admin'))
router.route("/").get(userController.getAllUsers).post(userController.createUser)
router.route("/:id")
      .get(userController.getUser)
      .patch(userController.updateUser)
      .delete(userController.deleteUser)
module.exports = router