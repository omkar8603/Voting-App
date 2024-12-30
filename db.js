const mongoose = require('mongoose');
require('dotenv').config();

// define mongodb url
const mongoURL = process.env.MONGODB_LOCAL 

const db = async() => {
    await mongoose.connect(mongoURL);
    console.log("db connect");
}


module.exports = db;
