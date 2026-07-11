const express = require("express")
const authController = require("../controller/auth.controller")
const authRouter =express()
const authMiddleware = require("../middlewares/auth.middleware")
// const authRouter = express.Router();
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

/**
 * @route GET /api/auth/get-me
 * @description get the current loggin in user details
 * @access private
 */

authRouter.get("/get-me",authMiddleware.authUser,authController.getMEController )

module.exports = authRouter