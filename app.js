const mongoose=require('mongoose');
const path=require('path');
const fs = require('fs');
const user=process.env.DB_USER;
const pass=process.env.DB_PASSWORD;
const name=process.env.DB_NAME;
const express=require('express');
const bodyParser=require('body-parser');
const HttpError=require('./models/error')
const PlacesRoutes=require('./routes/places-routes');
const UsersRoutes=require('./routes/user-routes');
const app=express();
app.use(bodyParser.json());
app.use('/uploads/images',express.static(path.join('uploads','images')));
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE');
    next();
})


app.use('/api/places',PlacesRoutes);
app.use('/api/users',UsersRoutes);
app.use((req,res,next)=>{
const error=new HttpError('Could not find this route ',404);
throw(error);
});
app.use((error,req,res,next)=>{
    if(req.file){
        fs.unlink(req.file.path,(err)=>{
            console.log(err);
        });
    }
    if(res.headerSent){
        return next(error);
    }
 res.status(error.code || 500);
   res.json({ message: error.message || 'An unknown error occurred!' });
    
})
mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0.68xzs.mongodb.net/${name}?retryWrites=true&w=majority`).then(()=>{
    app.listen(process.env.PORT||5000);
}).catch((error)=>{
console.log(error);
});
