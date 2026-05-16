import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes.js';
import clientRoutes from './modules/clients/clients.routes.js';
import productRoutes from './modules/products/products.routes.js';
import quoteRoutes from './modules/quotes/quotes.routes.js';
import invoiceRoutes from './modules/invoices/invoices.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import taskRoutes from './modules/tasks/tasks.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 requêtes par 15 min

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Middleware d'erreur (provisoire)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur' });
});

export default app;
