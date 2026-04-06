require('dotenv').config();

// 1. Import the dependencies
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import Models
const Message = require('./models/Message');
const Task = require('./models/Task'); 

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
// 7. Real-Time Logic (Socket.IO) & Nexus Bot
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
    });

    socket.on('sendMessage', async ({ roomId, sender, text }) => {
        try {
            // 1. Save and broadcast the human's message
            const newMessage = new Message({ room: roomId, sender, text });
            await newMessage.save();

            io.to(roomId).emit('message', {
                sender, text, timestamp: newMessage.timestamp
            });

            // 2. NEXUS AI CHATBOT LOGIC
            if (text.toLowerCase().includes('@nexus')) {
                let botResponse = `Hello ${sender}. I am Nexus AI. Type '@nexus help' to see what I can do.`;
                
                if (text.toLowerCase().includes('help')) {
                    botResponse = "🤖 COMMANDS:\n- '@nexus status': Check system health.\n- '@nexus ping': Test latency.\n- '@nexus clear': Instructions to clear cache.";
                } else if (text.toLowerCase().includes('status')) {
                    botResponse = "🟢 All workspace nodes are fully operational. Latency is sub-50ms.";
                } else if (text.toLowerCase().includes('ping')) {
                    botResponse = "🏓 Pong! Connection is stable.";
                }

                // Delay the bot response slightly so it feels natural
                setTimeout(async () => {
                    const botMessage = new Message({ room: roomId, sender: 'Nexus AI', text: botResponse });
                    await botMessage.save();
                    
                    io.to(roomId).emit('message', {
                        sender: 'Nexus AI',
                        text: botResponse,
                        timestamp: botMessage.timestamp
                    });
                }, 800);
            }

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
// --- TASK API ROUTES ---
app.get('/api/tasks/:roomId', async (req, res) => {
    try {
        const tasks = await Task.find({ room: req.params.roomId });
        res.json(tasks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.json(newTask);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/tasks/:taskId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 10. Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});