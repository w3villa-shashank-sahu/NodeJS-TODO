import { Sequelize } from "sequelize";
import { databaseConfig } from "../config/appConfig.js";

const sequelize = new Sequelize(databaseConfig.dbName, databaseConfig.userName, databaseConfig.password, {
    dialect: 'mysql'
})

try{
    await sequelize.authenticate();
    console.log('connection has been established successfully');
} catch (error){
    console.log('Failed to connect to database ', error);
}


export default sequelize;