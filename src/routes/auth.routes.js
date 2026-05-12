const express = require("express")
const authController = require("../controller/auth.controller")
const authRouter =express()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register",authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login",authController.loginUserController)

/**
 * @router GET /api/auth/logout
 * @description clear token from user and add token in the blacklist
 * @access public
 */
authRouter.get("/logout",authController.logoutUserController)
module.exports = authRouter