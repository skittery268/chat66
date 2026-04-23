// Servers
const express = require('express');
const http = require("http");
const { Server } = require("socket.io");

// DNS config
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Middlewares
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Import env info to process
dotenv.config();

// Config
const connectDB = require('./configs/connectDB');

// Controllers
const globalErrorHandler = require('./controllers/error.controller');
const authRouter = require('./routers/auth.router');
const groupRouter = require('./routers/group.router');
const messageRouter = require('./routers/message.router');

// ------------------------------ IMPORTS ----------------------------------------------

// http - one time comunication
// socket - open communication

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    }
});

// Helper middlewares

const config = {
    origin: process.env.CLIENT_URL,
    credentials: true
};

app.use(cors(config));
app.use(cookieParser(config));
app.use(express.json());

app.use((req, res, next) => {
    req.io = io;
    next();
})

// Routers
app.use('/api/auth', authRouter);
app.use('/api/group', groupRouter);
app.use('/api/message', messageRouter);

app.use('/', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server health is okay and running!"
    });
});

// Global error controller
app.use(globalErrorHandler);


// event-driven arch
// Server listening for connections
io.on('connection', (socket) => {
    // in this function socket is connected client
    console.log(`User connected: ${socket.id}`);

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        console.log(`Socket ${socket.id} joined room ${groupId}`);
    });

    socket.on('leaveGroup', (groupId) => {
        socket.leave(groupId);
        console.log(`Socket ${socket.id} left room ${groupId}`);
    });

    // we listen disconnect event from user
    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id} (${reason})`);
    });
});

server.listen(3000, () => {
    console.log('Server is listening at 3000');
    connectDB();
});