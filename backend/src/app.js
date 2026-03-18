const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors()); // Allow requests from your React frontend
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use('/api', apiRoutes); // Mount API routes

// Basic route for testing
app.get('/', (req, res) => {
  res.send('CodeWhisperer MERN Backend with Mistral AI is running!');
});

module.exports = app;