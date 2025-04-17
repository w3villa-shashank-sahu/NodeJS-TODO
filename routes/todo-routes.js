import express from "express";
import { myroutes } from "../config/constants.js";
import todoController  from "../controllers/todo-controller.js";
import AllowRole from "../middleware/autherization-middleware.js";
import { validateCreateTodo, validateTodoIdParam, validateUpdateTodoBody } from "../middleware/dataValidation-middleware.js";
import { isAuth } from "../middleware/auth-middleware.js";

// const todoController = new TodoController();
const todoRouter = express.Router();

todoRouter.get(myroutes.getTodo, isAuth, validateTodoIdParam, todoController.handleGetTodo);

todoRouter.get(myroutes.getAllTodo, isAuth, todoController.handleGetAllTodo);

todoRouter.post(myroutes.createTodo, isAuth, AllowRole(['ADMIN']), validateCreateTodo, todoController.handleCreateTodo);

todoRouter.put(myroutes.updateTodo, isAuth, validateTodoIdParam, validateUpdateTodoBody, todoController.handleUpdateTodo);

todoRouter.delete(myroutes.deleteTodo, isAuth, validateTodoIdParam, todoController.handleDeletTodo);

export default todoRouter;