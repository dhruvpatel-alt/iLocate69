const User =require('../models/user');
const jwt=require('jsonwebtoken')
const bcrypt = require('bcrypt');
const {validationResult}=require('express-validator');
const HttpError=require('../models/error');
const getUsers=async(req,res,next)=>{
  let users;
try{
 users=await User.find({},'-password');
}catch(err){
  const error=new HttpError('Cannot get User,pls Try Again',500);
  return next(error);
}
res.json({users:users.map(user=>user.toObject({getters:true}))});
}
const signup=async (req,res,next)=>{
  let hashPassword;
  const {name,email,password}=req.body;
  let errors=validationResult(req);
  if(!errors.isEmpty()){
    return next(
      new HttpError("Invalid Inputs passed,Pls try Again!",422)
      );
    }
    let user;
  
    try{
      user= await User.findOne({email:email});
    }catch(err){
      const error=new HttpError('Sign up Failed Pls try Again',500);
      return next(error);
    }
    if(user){
      const error = new HttpError(
        'User exists already, please login instead.',
        422
      );
      return next(error);
    }
    try{
      hashPassword = await bcrypt.hash(password, 12);
    }
      catch(err){
        const error=new HttpError('Could not Create user,pls try again ',500);
        return next(error);
      }
    if(!user){
      const CreatedUser=new User({
        name,email:email.toLowerCase(),password:hashPassword,places:[],
        image:req.file.path
});

try {
  await CreatedUser.save();
} catch (err) {
  const error=new HttpError('Signing up Failed,Pls Try again',500);
  return next(error);
}
let token;
try{
token=jwt.sign(
  {userId:CreatedUser.id,email:CreatedUser.email}
  ,process.env.JWT_KEY,
  {expiresIn:'1h'});
}
catch(err){
  const error=new HttpError('Could not Create user,pls try again ',500);
  return next(error);
}
res.status(201).json({userId:CreatedUser.id,email:CreatedUser.email,token:token});
}
else{
    return next( new HttpError('User Already Exists',422));
}
}

const login=async(req,res,next)=>{
const {email,password}=req.body;
let user;
try{
   user= await User.findOne({email:email.toLowerCase()});
}catch(err){
  const error=new HttpError('Sign up Failed Pls try Again',500);
return next(error);
}

if(!user ){
const error=new HttpError('Invalid Credentials,pls Try again',401);
return next(error);
}
let isValidPassword=false;
try{
isValidPassword=await bcrypt.compare( password,user.password); }
catch(err){
  const error=new HttpError('Login Failed,Pls Try again',500);
  return next(error);
}

if (!isValidPassword) {
  const error = new HttpError(
    'Invalid credentials, could not log you in.',
    403
  );
  return next(error);
  }
  let token;
    try{
    token=jwt.sign({userId:user.id,email:user.email},process.env.JWT_KEY,{expiresIn:'1h'});
    }
    catch(err){
      const error=new HttpError('Could not login,pls try again ',500);
      return next(error);
    }
    res.json({userId:user.id,email:user.email,token:token});


}

exports.signup=signup;
exports.getUsers=getUsers;
exports.login=login;