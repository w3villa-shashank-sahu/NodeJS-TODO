import winston from "winston";

const {combine, timestamp, printf, cli} = winston.format;

const logger = winston.createLogger({
    
    format: combine(
        timestamp(),
        cli(),
        printf((info) => `${info.timestamp.replace('T', ' ').substr(0, 19)} ${info.level} ${info.message}`)
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
      return `${timestamp.replace('T', ' ').substr(0, 19)}\n${message} \n`;
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