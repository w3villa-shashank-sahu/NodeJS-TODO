import { Sequelize } from "sequelize";
import { databaseConfig } from "../config/appConfig.js";

const sequelize = new Sequelize(databaseConfig.dbName, databaseConfig.userName, databaseConfig.password, {
    dialect: 'mysql'
})


export async function init() {
    try{
        // test the connection
        await sequelize.authenticate();
        console.log('database authenticated successfully');

        // create table if not present
        await sequelize.sync({logging:false});
        console.log('sync successfully');
    } catch (error){
        console.error('unable to start server: ', error)
    }
}

// try{
//     await sequelize.authenticate({logging: false});
//     console.log('connection has been established successfully');
// } catch (error){
//     console.log('Failed to connect to database ', error);
// }


export default sequelize;