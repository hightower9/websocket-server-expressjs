import winston from 'winston';
import settings from '../config/settings.js';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
	level: settings.app.env === 'production' ? 'info' : 'debug',
	format: combine(
		colorize({ all: true }),
		timestamp({
			format: 'YYYY-MM-DD hh:mm:ss.SSS A',
		}),
		align(),
		printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
	),
	transports: [
		new winston.transports.Console(),
		// Add file transport in production
		...(settings.app.env === 'production'
			? [
				new winston.transports.File({
					filename: 'logs/error.log',
					level: 'error',
				}),
				new winston.transports.File({ filename: 'logs/combined.log' }),
			]
			: []),
	],
});

export default logger;