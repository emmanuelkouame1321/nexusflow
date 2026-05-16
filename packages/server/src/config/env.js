import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Joi from 'joi';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

dotenv.config({ path: path.resolve(dirName, '../../../.env') });

// Le reste du code (Joi validation, export) ne change pas.

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(5000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  SMTP_HOST: Joi.string().hostname().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM: Joi.string().email().required(),
  UPLOAD_DIR: Joi.string().default('uploads'),
  MAX_FILE_SIZE: Joi.number().default(10 * 1024 * 1024), // 10 MB
  LOG_LEVEL: Joi.string().default('debug'),
}).unknown(); // on autorise d'autres variables

const { error, value: env } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('Invalid environment variables:', error.message);
  process.exit(1);
}

export default {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  },
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  },
  uploadDir: env.UPLOAD_DIR,
  maxFileSize: env.MAX_FILE_SIZE,
  logLevel: env.LOG_LEVEL,
};
