const fs=require('fs');
const getAllCoordinates=require('../routes/Location');
const HttpError=require('../models/error');
const {validationResult}=require('express-validator');
const Place=require('../models/place');
const User =require('../models/user');
const  mongoose  = require('mongoose');

const GetPlaceById=async(req,res,next)=>{
    const placeId=req.params.placeid;
    let place;
    try{
    place=await Place.findById(placeId);
    }catch(err){
        const error=new HttpError('something went wrong,cannot find place',500);
        return next(error);
    }
    if(!place){
        const error= new HttpError('Could not find a place for provided id.',404);
        return next(error);
    }
    res.json({place:place.toObject({getters:true})});
}

const GetPlaceByUserId=async (req,res,next)=>{
    const userId=req.params.uid;
    let userwithplaces;
    try{
        userwithplaces=await User.findById(userId).populate('places');
    }catch(err){
        const error=new HttpError('something went wrong,cannot find place',500);
        return next(error);
    }
 
    res.json({places:userwithplaces.places.map(place=>place.toObject({getters:true}))});
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
  
    const { title, description, address } = req.body;
  
    let coordinates;
    try {
      coordinates = await getAllCoordinates(address);
    } catch (error) {
      return next(error);
    }
  
    const createdPlace = new Place({
      title,
      description,
      address,
      latitude: coordinates.lat,
      longitude:coordinates.lng,
      image: req.file.path,
      creator:req.userData.userId
    });
  
    let user;
    try {
      user = await User.findById(req.userData.userId);
    } catch (err) {
      const error = new HttpError(
        'Creating place failed cannot fetch user, please try again.',
        500
      );
      return next(error);
    }
  
    if (!user) {
      const error = new HttpError('Could not find user for provided id.', 404);
      return next(error);
    }
  
    console.log(user);
  
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await createdPlace.save({
        session: sess
      });
      user.places.push(createdPlace);
      await user.save({
        session: sess
      });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError('Creating place failed, please try again.', 500);
      console.log(err);
      return next(error);
    }
  
    res.status(201).json({ place: createdPlace });
  };
  

const updatePlace=async(req,res,next)=>{
const {title,description,address}=req.body;
let errors=validationResult(req);
if(!errors.isEmpty()){
    console.log(errors);
 return next( new HttpError("Invalid Inputs passed,Pls try Again!",422));
}
const placeId=req.params.placeid;
let updatePlace;
try{
updatePlace=await Place.findById(placeId);
}catch(err){
    const error=new HttpError('something went wrong,cannot find place',500);
    return next(error);
};
if(updatePlace.creator.toString()!==req.userData.userId){
  const error=new HttpError('you are not allowed to edit  this place',401);
  return next(error);
}
   let coordinates=[];
if(title){
    updatePlace.title=title;
}
if(description){
    updatePlace.description=description;
}
if(address){
try{
    coordinates=await getAllCoordinates(address);
}catch(error){
return next(error);
}
    updatePlace.address=address;
    updatePlace.latitude=coordinates.lat;
    updatePlace.longitude=coordinates.lng;
}
try {
    await updatePlace.save();
} catch (err) {
    const error=new HttpError('Creating place Failed,Pls Try again',500);
    return next(error);
}
res.status(200).json({place:updatePlace.toObject({getters:true})});

}

const deletePlace=async (req,res,next)=>{
    const placeId=req.params.placeid;
    let  deletePlace;
    try{
      deletePlace=await Place.findById(placeId).populate('creator');
    }catch(err){
            const error=new HttpError('something went wrong,cannot find place',500);
            return next(error);
        };  
        if(deletePlace.creator.id!==req.userData.userId){
          const error=new HttpError('you are not allowed to delete  this place',401);
          return next(error);
        }
    if(!deletePlace){
      res.status(401).json({"message":"Cannot find a place to Delete"});
      return;
    }
    const imagePath=deletePlace.image;
    try{
        const sess=await mongoose.startSession();
        sess.startTransaction();
        await deletePlace.remove({session:sess});
        deletePlace.creator.places.pull(deletePlace);
        await deletePlace.creator.save({session:sess});
        await sess.commitTransaction();
    }
    catch(err){
        const error=new HttpError('something went wrong,cannot find place',500);
        return next(error);
    }; 
    fs.unlink(imagePath,err=>{
      console.log(err);
    });
    res.status(200).json({"message":"Deleted Successfully"});
}

exports.GetPlaceById=GetPlaceById;
exports.GetPlaceByUserId=GetPlaceByUserId;
exports.createPlace=createPlace;
exports.updatePlace=updatePlace;
exports.deletePlace=deletePlace;