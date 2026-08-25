const express = require("express")
const app = express()
const cors=require("cors")
const userRouter=require("./routes/userRoutes")


//middleware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//Routes
app.use('/api/v1/users',userRouter)
module.exports=app;