const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
// const testRoute = require('./routes/router');
// app.use('/api/data', testRoute);


const dataRoutes = require('./routes/data');
app.use('/api/data', dataRoutes);

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Basic route
app.get('/', (req, res) => res.send('API is running...'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
