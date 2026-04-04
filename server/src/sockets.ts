import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

const userSockets = new Map<string, string>();

export const initSockets = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
      socket.broadcast.emit('user_status_change', { userId, status: 'online' });
    });

    socket.on('disconnect', () => {
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          break;
        }
      }
      
      if (disconnectedUserId) {
        io.emit('user_status_change', { userId: disconnectedUserId, status: 'offline' });
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const getUserSocket = (userId: string) => {
  return userSockets.get(userId);
};

export const getOnlineUserIds = () => {
  return Array.from(userSockets.keys());
};
