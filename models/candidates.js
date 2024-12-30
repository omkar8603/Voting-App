const mongoose = require('mongoose');
const User = require('./user');

const  candidateSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    party : {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    votes: [
        {  
            user: {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'User',
                required : true,
                default:null,
            },
            votedAt : {
                type : Date,
                default : Date.now()
            }
        }
    ],
    voteCount : {
        type : Number,
        default : 0
    }
    
});




const candidate = mongoose.model('candidate', candidateSchema);

module.exports = candidate;