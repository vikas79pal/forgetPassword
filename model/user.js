const mongoose =require('mongoose')

const {Schema}=mongoose

const User = new Schema({
    fullName:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:{
        type:String,
        default:null
    },
    expiry:{
        type:Date,
        default:null
    }
})

const usermodel=mongoose.model("user",User)
module.exports=usermodel