import express from 'express';
import { appConfig } from './config/appConfig.js';
import { init } from './services/databaseService.js'; // Import the init function
import authRouter from './routes/auth-routes.js';
import './config/passport-config.js'
import dashboardRoutes from './routes/dashboard-routes.js';
import todoRouter from './routes/todo-routes.js';
import {logError, logger} from './utils/winston.js';


// create express object
const app = express();

// middlewares
app.use(express.json())

//routes
app.use('/auth', authRouter)
app.use('/', dashboardRoutes)

// Add logging middleware specifically for /todo path
app.use('/todo', (req, res, next) => {
    logger.info(`Request received for /todo path: ${req.method} ${req.originalUrl}`);
    next();
});

app.use('/todo', todoRouter)


init().then(
    () => {
        logger.info('database connected successfully')
        const server = app.listen(appConfig.port, ()=> logger.info(`server running on PORT: ${appConfig.port}`))
        server.on('error', (error) => {
            logError({
                error,
                functionName: 'init',
                route: 'main file'
              });
        });
    }
).catch(
    (error) => {
        logError({
            error,
            functionName: 'init',
            route: 'main file'
          });
    }
)
