import { DataTypes } from "sequelize"
import sequelize from "../services/databaseService.js"

const userModal = sequelize.define('user', {
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name : {
        type: DataTypes.STRING,
        allowNull : false
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password : {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    dp : {
        type: DataTypes.STRING,
        allowNull: true
    },
    googleID: {
        type: DataTypes.STRING,
        allowNull: true
    },
    authToken : {
        type: DataTypes.TEXT,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'USER'
    }
})



export default userModal;