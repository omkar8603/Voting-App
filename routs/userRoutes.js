const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt')


// create signup for user


router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        
        if (data.role === 'admin'){
            const check = await User.findOne({role : 'admin'});
           if(check){
            console.log("Only one admin is allowed.");
            return res.status(409).json({message : 'Only one admin is allowed'});
           }
        }

     
        //create a new user document using the monggose model
        const newUser = new User(data);

        // save the new user to the database
        const responce = await newUser.save();
        console.log('data saved');

        const payload = {
            id: responce.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log('token  is :', token);

        res.status(200).json({responce : responce, token : token});
        
    }
    catch(error){
       console.log(error);
       res.status(500).json({error : 'Internal Server error'});
    }
})


// Login route

router.post('/login', async(req, res) => {
    
   try {
     // extract aadharCardNumber and password from req.body
     const {aadharCardNumber, password} = req.body;

     // find user by username
     const user = await User.findOne({aadharCardNumber : aadharCardNumber});
 
     // if user not exits or password does not match , return error
     if(!user || !(await user.comparePassword(password))){
         return res.status(401).json({error : 'Invalid username or password'});
     } 
 
     // generate Token
     const payload = {
         id : user.id
     }
 
     // generate token 
     const token = generateToken(payload);
     console.log('token is : ', token);
 
     // return token as responce
     res.json({token})
   } 
   catch (error) {
    console.error(error);
       res.status(500).json({error : 'Internal Server error'});
   }
})

router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try {
        
        const userData = req.body;
        const userId = userData.id;
        const user = await User.findById(userId)

        res.status(200).json({user});
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
    }
})

router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user; // Extract the id from the token
        const {currentPassword, Newpassword} = req.body  // Extrct current and new password from req.body

        // find the user by userId
        const user = await User.findById(userId);

        if(!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error : 'Invalid username or password'});
        } 

        //Update the user's password
        user.password = Newpassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({message : 'Password updated'});
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
    }
})


// get all user

router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        
       const allUser = users.map((data) => {
          return {
            name : data.name,
            age : data.age,
            email : data.email,
            mobile : data.mobie,
            address : data.address
          }
       })

        console.log("all user are shows");
        res.status(200).json({allUser});

    } catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
    }
})

module.exports =  router;