const express = require("express")
const router=express.Router()
const userController=require('../controllers/userController')

router.get('/stats',userController.getStats)
router.get("/search/:query",userController.searchUsers)
router.get("/",userController.getAllUsers)
router.get("/:id",userController.getUserById)
router.post("/",userController.createUser)
router.put("/:id",userController.updateUser)
module.exports
= router;