const checkAuth=require('../middleware/check-auth');
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const placesControllers = require("../controllers/place-controllers");
const fileUpload = require('../middleware/file-upload');

router.get("/:placeid", placesControllers.GetPlaceById);

router.get("/user/:uid", placesControllers.GetPlaceByUserId);

router.use(checkAuth);

router.post("/",fileUpload.single('image'), 
[check("address").not().isEmpty(),
check("title").isLength({min:3}),
check("description").isLength({min:5})],    
 placesControllers.createPlace);
 
router.patch("/:placeid",[check("address").not().isEmpty(),
check("title").isLength({min:3}),
check("description").isLength({min:5})], placesControllers.updatePlace);
router.delete("/:placeid", placesControllers.deletePlace);

module.exports = router;
