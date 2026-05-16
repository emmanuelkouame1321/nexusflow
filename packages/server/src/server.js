import app from './app.js';
import env from './config/env.js';
import prisma from './lib/prisma.js';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Connecté à la base de données');
    app.listen(env.port, () => {
      console.log(`Serveur démarré sur http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage :', error);
    process.exit(1);
  }
};

start();
