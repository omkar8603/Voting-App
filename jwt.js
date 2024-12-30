const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtAuthMiddleware = (req, res, next) => {
    // firat check request header has autherization or not

    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error : 'Token not found'});

    //Extract the jwt token from the request header
    const token = authorization.split(' ')[1];

    if (!token) return res.status(401).json({error: 'Unauthorized'});

    try {

        // verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //Attached user information to the request object
        req.user = decoded;
        console.log(decoded);
        next();
    } catch (error) {
        console.error(error)
        res.status(401).json({error : 'Invalid Token'});
        
    }
}


//Function to generate the Token

const generateToken = (userData) =>{
    // Generate new jwt token using user data
    return jwt.sign(userData, process.env.JWT_SECRET);
}
module.exports = {jwtAuthMiddleware, generateToken} 