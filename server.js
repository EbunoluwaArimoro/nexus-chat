require('dotenv').config();

// 1. Import the dependencies
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import Models
const Message = require('./models/Message');

// 2. Initialize the Express application
const app = express();

// 3. Set up Middleware
app.use(express.json());
app.use(cors()); // Allows the React frontend to communicate with this server

// 4. Create the HTTP server
const server = http.createServer(app);

// 5. Initialize Socket.IO (This was missing in your snippet)
const io = new Server(server, {
    cors: {
        origin: "*", // Allows connections from any origin (e.g., your React app)
    }
});

// 6. Connect the Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/chatRooms')); // THIS LINE ENABLES CHANNEL CREATION

// 7. Real-Time Logic (Socket.IO)
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // User joins a specific room
    socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    // Handle sending a message
    socket.on('sendMessage', async ({ roomId, sender, text }) => {
        try {
            // 1. Create and save message to Database
            const newMessage = new Message({ room: roomId, sender, text });
            await newMessage.save();

            // 2. Broadcast the message to everyone in THAT room
            io.to(roomId).emit('message', {
                sender,
                text,
                timestamp: newMessage.timestamp
            });
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

// 8. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error.message);
    });

// 9. Basic test route
app.get('/', (req, res) => {
    res.send('Nexus Chat Backend is running!');
});

// 10. Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});