import express from 'express';
import { appConfig } from './config/appConfig.js';
import authRouter from './routes/auth-routes.js';
import './config/passport-config.js'
import dashboardRoutes from './routes/dashboard-routes.js';
import todoRouter from './routes/todo-routes.js';


// create express object
const app = express();

// middlewares
app.use(express.json())

//routes
app.use('/auth', authRouter)
app.use('/', dashboardRoutes)
app.use('/todo', todoRouter)


init().then(
    () => {
        console.log('database connected successfully')
        // start server
        const server = app.listen(appConfig.port, ()=>console.log('server running on PORT: ', appConfig.port))
        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
        });
    }
).catch(
    (error) => {
        console.error('Unable to start server:', error);
    }
)

