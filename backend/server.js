// ============================================
// HireGuide Connect Backend Server
// Node.js + Express + PostgreSQL + Socket.io
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://hire-guide-ngivs4e4b-john-kumars-projects-4029716d.vercel.app',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Routes
const authRoutes = require('./src/routes/auth');
const guideRoutes = require('./src/routes/guides');
const hotelRoutes = require('./src/routes/hotels');
const bookingRoutes = require('./src/routes/bookings');
const reviewRoutes = require('./src/routes/reviews');
const messageRoutes = require('./src/routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io for real-time messaging
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} joined`);
  });

  // Send message
  socket.on('sendMessage', async (data) => {
    const { receiverId, message, bookingId, senderId } = data;
    
    // Save message to database
    try {
      const db = require('./src/models/db');
      const result = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, booking_id, message)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [senderId, receiverId, bookingId, message]
      );

      const savedMessage = result.rows[0];

      // Send to receiver if online
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', savedMessage);
      }

      // Confirm to sender
      socket.emit('messageSent', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('markAsRead', async (data) => {
    const { messageIds } = data;
    try {
      const db = require('./src/models/db');
      await db.query(
        'UPDATE messages SET is_read = true WHERE id = ANY($1)',
        [messageIds]
      );
      socket.emit('messagesMarkedRead', { messageIds });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   🚀 HireGuide Connect Backend API     ║
    ║   Server running on port ${PORT}        ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
    ║   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'} ║
    ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };