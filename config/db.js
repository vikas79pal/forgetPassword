const mongoose=require('mongoose')
require('dotenv').config()

module.exports=()=>{
    mongoose.connect(process.env.DB_CONN,{useNewUrlParser:true,useUnifiedTopology:true})
.then(console.log("db connected")).catch(err=>{
    console.log("connection failed");
})
}