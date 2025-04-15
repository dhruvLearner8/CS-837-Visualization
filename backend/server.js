// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());
// // const testRoute = require('./routes/router');
// // app.use('/api/data', testRoute);


// const dataRoutes = require('./routes/data');
// app.use('/api/data', dataRoutes);

// const PORT = process.env.PORT || 5000;

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.log(err));

// // Basic route
// app.get('/', (req, res) => res.send('API is running...'));
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors({
//     origin: 'https://cs-837-visualization.vercel.app',
//     methods: ['GET', 'POST'],
//     credentials: true
//   }));
app.use(cors());
app.use(express.json());

// Routes
const dataRoutes = require('./routes/data');
app.use('/api/data', dataRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));





// Default route
app.get('/', (req, res) => {
  res.send('🚀 Backend API is running...');
});

app.listen(PORT, () => {
  console.log(`🌐 Server is running on http://localhost:${PORT}`);
});
