import http from 'node:http';
import { Server as SocketServer } from 'socket.io';
import app from './app.js';
import env from './config/env.js';
import prisma from './lib/prisma.js';
import { setupSocket } from '../socket/index.js';

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Rendre io accessible dans toute l'application
app.set('io', io);

// Configurer Socket.io
setupSocket(io);

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Connecté à la base de données');
    server.listen(env.port, () => {
      console.log(`Serveur démarré sur http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage :', error);
    process.exit(1);
  }
};

start();
