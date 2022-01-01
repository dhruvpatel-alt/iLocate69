const jwt = require('jsonwebtoken');

const HttpError=new require('../models/error');

module.exports = (req, res, next) => {
  if(req.method==='OPTIONS'){
    return next();
}
  try {
    var token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if (!token) {
            console.log(token);
        const error = new HttpError('Authenticbation failed!', 401);
        return next(error);
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    return next(error)
  }
};
