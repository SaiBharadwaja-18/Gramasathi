import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Convert __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5002;

// Create HTTP and WebSocket server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads folder statically — clean and correct
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route imports
import authRoutes from './routes/auth.js';
import charityRoutes from './routes/charity.js';
import profileRoutes from './routes/profile.js';
import externalRoutes from './routes/external.js';
import campsRoutes from './routes/camps.js';
import rozgarRoutes from './routes/rozgarRoutes.js';
import grievanceRoutes from './routes/grievance.js';

// Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/charity', charityRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/camps', campsRoutes);
app.use('/api', rozgarRoutes);
app.use('/api/grievances', grievanceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('GramaSathi API is running');
});

// WebSocket events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('join_campaign', (campaignId) => {
    socket.join(campaignId);
    console.log(`User ${socket.id} joined campaign ${campaignId}`);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });
