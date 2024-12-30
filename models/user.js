const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const  userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true
    },
    email : {
        type : String,
        
    }, 
    mobie : {
        type : String,
    },
    address : {
        type : String,
        required : true
    },
    aadharCardNumber : {
        require : true,
        type : Number,
        unique : true
    },
    password : {
        require : true,
        type : String
    },
    role : {
        type : String,
        enum : ['voter', 'admin'],
        default : 'voter'
    },
    isVoted : {
        type : Boolean,
        default : false
    }
})



userSchema.pre('save', async function (next) {
     

    const user = this;

    // Hash the password only if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    try {
        // hash password generstion
        const salt = await bcrypt.genSalt(10); // generate salt

        // hash password
        const hashpassword = await bcrypt.hash(user.password, salt); 
        
        // Override the plain password with hashed one
        user.password = hashpassword;

        next();
    } catch (error) {
        return next(error);
    }
})


userSchema.methods.comparePassword = async function(candidatePassword) {
     try {
       // use brcypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password)
        return isMatch;
     } catch (error) {
        throw error;
     }
}



const user = mongoose.model('user',userSchema);

module.exports = user;