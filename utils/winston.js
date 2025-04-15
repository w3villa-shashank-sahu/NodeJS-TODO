import winston from "winston";

const {combine, timestamp, printf, errors, cli} = winston.format;

const logger = winston.createLogger({
    // format: winston.format.cli(),
    
    format: combine(
        timestamp(),
        cli(),
        errors({ stack: true }),
        printf((info) => `${info.timestamp} ${info.level} ${info.message} ${info.errors}`)
    ), 
    level: 'debug',
    transports: [
        new winston.transports.Console()
    ]
})

// Custom format to include timestamp and clean layout
const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    // winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.cli(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp}\n${message} \n`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console()
  ]
});
 
export const logError = ({ error, functionName, route }) => {
    const message = `
    Error in function: ${functionName}
    Route: ${route}
    Message: ${error.message}
    Stack: ${error.stack}
    `.trim();
    errorLogger.error(message);
  };


export {logger}; 