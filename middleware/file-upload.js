
const multer=require('multer');
var uuidv1 = require('uuidv1')
const MIME_TYPE_MAP={

    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
const fileUpload=multer({
    limits:50000000,
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,"uploads/images");
        },
        filename:(req,file,cb)=>{
            const ext=MIME_TYPE_MAP[file.mimetype];
            cb(null,uuidv1()+"."+ext)
        }
    }),
    fileFilter:(req,file,cb)=>{
        const isValid= !!MIME_TYPE_MAP[file.mimetype];
        let error=isValid?null:new Error("Invalid mime Type!");
        cb(error,isValid);
    }
});
module.exports=fileUpload;