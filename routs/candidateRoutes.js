const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidates');
const {jwtAuthMiddleware, generateToken} = require('../jwt')
const User = require('../models/user');
const { use } = require('passport');










const checkAdminRole =  async (userId) => {
    try {
    
        const user = await User.findById(userId);
        
        return user.role === 'admin';
    } catch (error) {
        return false;
    }
}

// post route to add candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
    console.log("in post");
        if (!(await checkAdminRole(req.user.id))){
            console.log(checkAdminRole);
            console.log("user is not admin")
          return res.status(404).json({message : 'user has not admin role'}); 
        }

        const data = req.body; // assuming the request body contains the candidate data
        
        //create a new user document using the monggose model
        const newCandidate = new Candidate(data);

        // save the new user to the database
        const responce = await newCandidate.save();
        console.log('data saved');

        res.status(200).json({responce : responce});
        
    }
    catch(error){
       console.log(error);
       res.status(500).json({error : 'Internal Server error'});
    }
})
 


router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
      
        if (! await checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'user has not admin role'}); 
          }

        const candidateId = req.params.candidateID.trim(); // Extract the id from the token
        const updatedCandidateData = req.body; 
        
        // find the user by userId
        const responce = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new : true, //REturn the updated document
            runValidators : true, // run mongoes validation
        })
         
        if (!responce) {
            return res.status(403).json({error : 'candidate not found'});
        }
      
        console.log('Data Updated');
        res.status(200).json({responce});
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
    }
})

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateId = req.params.candidateId.trim();

        const responce = await Candidate.findByIdAndDelete(candidateId);
        // console.log("responce : ", responce);

        if(!responce){
            console.log('candidate does not exist');
            return res.status(403).json({error : 'cnadidate not found'});
        }
        console.log("in delete route");
        res.status(200).json({responce});
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
    }
})



// let's start voting
router.post('/vote/:candidateId', jwtAuthMiddleware, async(req, res) => {
    // not admin  can vote
    // user can only vote once

    // find the candidate document with specified candidateID
    const candidateId = req.params.candidateId;
    console.log(candidateId);
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate){
         return res.status(404).json({message : 'candidate not found'});
        }

         const user = await User.findById(userId);
         if (!user){
            return res.status(404).json({message : 'user not found'});
           }

         if (user.isVoted) {
            return res.status(400).json({message : "you have already voted"});
         }  

         if (user.role === 'admin'){
            return res.status(403).json({message : 'Admin are not allowed to vote'});
         }
      

         //  Update the candidate document to record the vote
        candidate.votes.push({user : userId})
        // candidate.votes.push({
        //     user: userId, // This is where you include the user ID
        //     votedAt: new Date(), // You can also include the date
        // });

        candidate.voteCount = (candidate.voteCount || 0) + 1;
        await candidate.save();
        
        user.isVoted = true;
        await user.save();

        res.status(200).json({message : "vote recorded successfully"});

    } 
    catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
    }
})

router.get('/vote/count', async (req, res) => {
    try {
        // find the all candidate and sort them by voteCount to descending order

        const candidate = await Candidate.find().sort({voteCount : 'desc'});

        // Map the candidate to only return there name and votecount
        const voteRecord = candidate.map((data) => {
            return {
                name : data.name,
                party : data.party,
                count : data.voteCount
            };
        })

        return res.status(200).json(voteRecord);

    } 
    catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
    }
})

router.get('/candidates', async (req, res) => {
     try {
         
        const candidate = await Candidate.find();

       
        console.log("data is fetched");
        res.status(200).json({candidate});

     } catch (error) {
        console.error(error);
        res.status(500).json({error : 'Internal Server error'});  
     }
})

module.exports =  router;