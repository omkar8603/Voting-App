const express = require('express');
const app = express();
const db = require('./db');
db();
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json()) //  req.body
const PORT = process.env.PORT || 3000;
const jwtAuthMiddleware = require('./jwt');
app.use(express.json());  // Proper middleware setup



// Import the router files
const userRoutes = require('./routs/userRoutes')
const candidateRoutes = require('./routs/candidateRoutes');


// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, () => {
    console.log(`Server is Listning on port ${PORT}`);
})