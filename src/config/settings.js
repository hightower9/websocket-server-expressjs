import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const settings = {
    app: {
        port: process.env.PORT || 6001,
        env: process.env.NODE_ENV || 'development',
        secret: process.env.APP_SECRET || 'your-secret-key',
        laravelUrl: process.env.LARAVEL_URL || 'http://localhost:8000'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || ''
    },
    jwt: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: process.env.JWT_ISSUER || 'socket-server'
    }
};

export default settings;