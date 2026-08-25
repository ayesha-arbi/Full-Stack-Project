const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        trim:true
    },
    phone:{
        type:String,
        required:true
    },
     status:{
        type:String,
        default:"Active",
        enum:['Active','Inactive']
    },
    createdAt:{
        type:Date,
        default: Date.now,
    }

})

module.exports=mongoose.model("UserCopy",userSchema)