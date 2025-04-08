import { DataTypes } from "sequelize";
import sequelize from "../services/databaseService.js";

const todoModal = sequelize.define(
    'Todo', {
        id : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, 
        title:  {
            type: DataTypes.STRING,
            allowNull: false,
        },
        desc: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        done: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }
)

export default todoModal;