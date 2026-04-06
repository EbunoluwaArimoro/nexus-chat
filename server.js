require('dotenv').config();

// 1. Import the dependencies we installed
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// 2. Initialize the Express application
const app = express();

// 3. Set up Middleware
// This allows your app to understand JSON data sent from the frontend
app.use(express.json());

// 4. Create an HTTP server using the Express app
const server = http.createServer(app);

// 5. Initialize Socket.IO on the server for real-time features
const io = new Server(server, {
    cors: {
        origin: "*", // Allows your frontend to connect to the backend
    }
});

// 6. Connect to MongoDB using the environment variable
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error.message);
    });

// 7. Set up a basic test route
app.get('/', (req, res) => {
    res.send('Nexus Chat Backend is running!');
});

// 8. Define the port and start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});