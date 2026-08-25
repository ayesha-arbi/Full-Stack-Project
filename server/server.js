const dotenv =require("dotenv")
dotenv.config();
const mongoose=require("mongoose")
const app = require("./app")
const dns=require("dns")

//change server
dns.setServers(['1.1.1.1','8.8.8.8'])

//MongoDB

mongoose.connect(process.env.MONGODB_URI.replace('<DATABASE_PASSWORD>',process.env.DATABASE_PASSWORD)).then(()=>
    console.log("DATABASE CONNECTED")
).catch((error)=>{
    console.log("Mongo DB connection error", error)
})


const port = process.env.PORT || 5001;
app.listen(port,()=>{
    console.log(`Server running on ${port}`)
})

