import { authenticateSocket } from './auth.js';

export function setupSocket(io) {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`Utilisateur connecté : ${socket.user.id}`);

    // Rejoindre une room personnelle pour les notifications
    socket.join(`user:${socket.user.id}`);

    socket.on('disconnect', () => {
      console.log(`Utilisateur déconnecté : ${socket.user.id}`);
    });
  });
}
