import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  if (!socket) {
    socket = io('/', {
      // Le proxy Vite redirige /socket.io vers le serveur
      transports: ['websocket', 'polling'],
      auth: {
        // On peut envoyer le token d'accès (mais le serveur lit le cookie)
      },
    });

    socket.on('connect', () => {
      console.log('🔌 Connecté au serveur Socket.io');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur Socket.io');
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}