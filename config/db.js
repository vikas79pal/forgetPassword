const mongoose=require('mongoose')
require('dotenv').config()

module.exports=()=>{
    mongoose.connect(process.env.DB_CONN)
.then(console.log("db connected")).catch(err=>{
    console.log("connection failed");
})
}