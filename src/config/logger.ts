import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json } = format;

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, context }) => {
  return `${timestamp} [${context || 'application'}] ${level}: ${message}`;
});

// Create the logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json() // Log in JSON format for compatibility with Kibana
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Colorize the output
        consoleFormat // Use custom format for console
      )
    }),
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        json() // Log in JSON format
      )
    })
  ]
});

export default logger;
