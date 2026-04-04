import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import http from 'http';
import { initSockets } from './sockets';

// Route Imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import friendRequestRoutes from './routes/friendRequestRoutes';
import storyRoutes from './routes/storyRoutes';

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSockets(server);

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/friend-requests', friendRequestRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Curator API running 🚀');
});

// Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});