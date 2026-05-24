import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import compression from 'compression';
import authRoutes from './modules/auth/auth.routes.js';
import clientRoutes from './modules/clients/clients.routes.js';
import productRoutes from './modules/products/products.routes.js';
import quoteRoutes from './modules/quotes/quotes.routes.js';
import invoiceRoutes from './modules/invoices/invoices.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import taskRoutes from './modules/tasks/tasks.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import attachmentRoutes from './modules/attachments/attachments.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import rolesRoutes from './modules/roles/roles.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // illimité en dev
    message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' },
  }),
);

// Routes
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/attachments', attachmentRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Middleware d'erreur (provisoire)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur' });
});

export default app;
