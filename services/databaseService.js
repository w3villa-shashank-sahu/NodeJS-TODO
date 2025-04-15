import { Sequelize } from "sequelize";
import { databaseConfig } from "../config/appConfig.js";
import {logger, logError} from "../utils/winston.js"

const sequelize = new Sequelize(databaseConfig.dbName, databaseConfig.userName, databaseConfig.password, {
    dialect: 'mysql'
})


export async function init() {
    try{
        // test the connection
        await sequelize.authenticate();
        logger.info('database authenticated successfully');

        // create table if not present
        await sequelize.sync({logging:false});
        logger.info('sync successfully');
    } catch (error){
        logError({error, functionName : 'databaseinit',route: req.originalUrl })
    }
}

export default sequelize;