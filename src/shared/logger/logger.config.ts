import { format } from 'winston';
import * as winston from 'winston';

const { prettyPrint } = format;

const customLogFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  prettyPrint({
    colorize: true,
  }),
  format.printf((log) => {
    let logData = null;
    if (log?.data) {
      logData = JSON.stringify(log?.data, null, 0);
    } else {
      logData = log.error;
    }
    return `${log?.timestamp} [${log?.level}] [${log?.message}] [from: ${log?.caller}] 
  [log: ${logData}]`;
  }),
  format.colorize({ all: true }),
);

export const loggerConfig = {
  transports: [
    new winston.transports.File({
      filename: './logger/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: './logger/debug.log',
      level: 'debug',
    }),
    new winston.transports.Console({
      level: 'debug',
    }),
  ],
  format: customLogFormat,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
  },
};
