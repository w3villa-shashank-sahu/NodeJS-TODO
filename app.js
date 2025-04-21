import express from 'express';
import { appConfig } from './config/appConfig.js';
import { init } from './services/databaseService.js'; // Import the init function
import authRouter from './routes/auth-routes.js';
import './config/passport-config.js'
import dashboardRoutes from './routes/dashboard-routes.js';
import todoRouter from './routes/todo-routes.js';
import {logError, logger} from './utils/winston.js';
import cookieParser from 'cookie-parser';


// create express object
const app = express();

// middlewares
app.use(express.json())
app.use(cookieParser())

//routes
app.use('/auth', authRouter)
app.use('/', dashboardRoutes)
app.use('/todo', todoRouter)


init().then(
    () => {
        logger.info('database connected successfully')
        const server = app.listen(process.env.PORT ?? appConfig.port, ()=> logger.info(`server running on PORT: ${process.env.PORT ?? appConfig.port}`))
        server.on('error', (error) => {
            logError({error, functionName:'init', route:'app.js'});
        });
    }
).catch(
    (error) => {
        logError({error, functionName:'init', route:'app.js'});
    }
)
