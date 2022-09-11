const express=require('express')
const mongoose=require('mongoose')
require("./config/db")()
const jwt=require("jsonwebtoken")
const app=express()
const bcrypt=require('bcryptjs')
const Port =process.env.Port || 4000
const userModel=require('./model/user')
app.use(express.static("public"));


app.set("view engine", 'ejs')
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// Nodemailer

const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS // naturally, replace both with your real credentials or an application-specific password
  }
});

const MailFunc=(from,to,sub,text,html="")=>{
    const mailOptions = {
        from: from,
        to: to,
        subject: sub,
        text: text,
        html:html
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}








app.get("/",(req,res)=>{

    res.status(200).send("Hare Krishna!")

})

app.get("/reg",(req,res)=>{

    res.render("register")
})

app.post("/reg",async (req,res)=>{
    try {
        const {email,password,phone,fullname}=req.body

        // if user has not filled all the feild
        if (!(email && password)){
            res.status(400).send("all fields are required")
        }

        // if user already exist in db
        const user_exist =await userModel.findOne({email:email.toLowerCase()})

        if (user_exist){
            res.status(400).send("user already exist")

        }
        const hashpass= await bcrypt.hash(password,10)
        const user = userModel.create({
            email:email.toLowerCase(),
            password:hashpass,
            phone,
            fullName:fullname
        })

        // sending mail to user that ,he as successfully registered

        MailFunc(process.env.GMAIL,req.body.email,"succesfully reg","thanks for registering")



        res.status(201).send("sucessfully registered")
    } catch (error) {
        console.log(error);
    }
    
})

app.get("/log",(req,res)=>{
    res.render("login")
})

app.post("/log",async(req,res)=>{
    try {
        const {email,password}=req.body
        // check whether they have filled all the filled or not
        if(!(email && password)){
            res.status(400).send("all feilds are required")
        }

        // check if user exist with that email id or not

        const user_exist = await userModel.findOne({email:email.toLowerCase()})
        if (user_exist){
            // check whether the entered password matches with the reqistered one or not
            const isPassSame= await bcrypt.compare(password,user_exist.password)
            if (isPassSame){
                res.status(200).send("You r succesfully logged in")
                
        // sending mail to user that ,he as successfully registered

        MailFunc(process.env.GMAIL,req.body.email,"succesfully Logged In","Confirmation msg")


            }
            res.status(400).send("Invalid Password")
        }
        res.status(400).send("User doesn't exist")

        
    } catch (error) {
        console.log(error);   
    }

    
})

app.get("/forpass",async(reg,res)=>{
    res.render('forgetpassword')
})

app.post("/forpass",async (req,res)=>{
    try {
        // lets find whether the user exist or not
        const {email}=req.body
        const user =await userModel.findOne({email:email.toLowerCase()})
        if (user){
            // creating JWT token
            const jwtToken=jwt.sign({
                
                    user:user.email
                
            },process.env.SECRET,{
                expiresIn:Date.now()+(2*60*60*1000)
               

            })
            console.log(typeof jwtToken);
            
            // store this jwtToken in db and share it in the url for the comparision purpose
            user.resetToken=jwtToken
            user.expiry=Date.now()+(2*60*60*1000)
            user.save().then(()=>{console.log("succesfully saved");}).catch(err=>{console.log(err);})
            
            // mailing link to user
            const htmlText=`<a href="${req.protocol}://${req.headers.host}/forgotpass/${jwtToken}" > link </a>`
            MailFunc(process.env.GMAIL,req.body.email,"passss",htmlText)

            res.status(200).send("forget password mail has been sent to ur registered email id")
        }
        res.status(400).send("user doesnt exist")

    } catch (error) {
        console.log(error);
    }
})

app.get("/forgotpass/:Token",async (req,res)=>{
    try {
        
    
    // check if token is there in the url or not
    // fetching token from url
    const fetchedToken=req.params.Token

    // verifying jwt token
    console.log("aa rha hu ai",typeof fetchedToken);
    const isValidToken=  jwt.verify(fetchedToken,process.env.SECRET)
    
    // fetching user detail from db to check whether the token is expired or not
    
    const userDetail=await userModel.findOne({email:isValidToken.user.toLowerCase()})
    console.log("hi",isValidToken);
    const userStoredSessionTime=new Date(userDetail.expiry)
    // fetching current Date
    const currentDate= new Date()
    
    console.log(currentDate.getTime(), "  vik  ",userStoredSessionTime.getTime());
    if (await currentDate.getTime()<(await userStoredSessionTime.getTime())){

        // most imp step for availing the forget password 
        res.status(200).render("NewPassword",{email:isValidToken.user.toLowerCase()})
    }
    res.render("forgetpassword")
    // console.log(isValidToken);
    //     res.status(200).send(fetchedToken)

} catch (error) {
        console.log(error);
        res.render("forgetpassword")
}
})

app.get("/setPass",(req,res)=>{
    console.log(req.params.Token);
    res.render("NewPassword",{email:req.params.Token})
})

// setting new password
app.post("/setPass", async(req,res)=>{
    try {
        
    
    console.log(req.body);
    const {password}=req.body
    if (!password){
        // console.log(req.);
        res.send("plz Enter the password")
        
    }
    const user= await userModel.findOne({email:req.body.email})
    const hashPass=await bcrypt.hash(req.body.password,10)

    user.password=hashPass
    user.expiry=null
    user.resetToken=null
    user.save().then(()=>{
        console.log("succesfully password changed");
    }).catch((err)=>{console.log(err);})
    res.status(200).send("password changed succesfully")

} catch (error) {
        
}



    
})




app.listen(Port,()=>{
    console.log(`CONECCTED TO PORT ${Port}...`)

})