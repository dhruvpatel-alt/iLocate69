
const HttpError=require('../models/error');
const axios =require('axios');

const getAllCoordinates=async (address)=>{
    let data;
    try{
        const url='https://api.mapbox.com/geocoding/v5';
        const endpoint='mapbox.places';
        const searchText=encodeURIComponent(address);
        const API_KEY=process.env.MAPBOX_API;
        const response=await axios({
method:"GET",
            url:(`${url}/${endpoint}/${searchText}.json?access_token=${API_KEY}`)});
        data=response.data;
    }catch(e){
        throw new HttpError("Something went Wrong",500);
    }
if(!data||data.status==='ZERO_RESULTS'){
    throw new HttpError("Could not Find Location",422);
  
}
const [lng,lat]=data.features[0].center;
const coordinates={
    lng,lat
}

return coordinates;
}

module.exports=getAllCoordinates;