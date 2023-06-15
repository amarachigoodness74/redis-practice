import winston from "winston";

const logDirectory = './logs';

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'redis-service' },
  transports: [
    new winston.transports.File({ filename: 'errors.log', dirname: './logs', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log', dirname: './logs', }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;