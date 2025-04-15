import express from "express";
import { myroutes } from "../config/constants.js";
import { handleCreateTodo, handleDeletTodo, handleGetAllTodo, handleGetTodo, handleUpdateTodo } from "../controllers/todo-controller.js";
import AllowRole from "../middleware/autherization-middleware.js";
import { validateCreateTodo, validateTodoIdParam, validateUpdateTodoBody } from "../middleware/dataValidation-middleware.js";

const todoRouter = express.Router();

todoRouter.get(myroutes.getTodo, validateTodoIdParam, handleGetTodo);

todoRouter.get(myroutes.getAllTodo, handleGetAllTodo);

todoRouter.post(myroutes.createTodo, AllowRole(['ADMIN']), validateCreateTodo, handleCreateTodo);

todoRouter.put(myroutes.updateTodo, validateTodoIdParam, validateUpdateTodoBody, handleUpdateTodo);

todoRouter.delete(myroutes.deleteTodo, validateTodoIdParam, handleDeletTodo);

export default todoRouter;
