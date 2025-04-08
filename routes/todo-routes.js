import express from "express";
import { myroutes } from "../config/constants.js";
import { handleCreateTodo, handleDeletTodo, handleGetAllTodo, handleGetTodo, handleUpdateTodo } from "../controllers/todo-controller.js";

const todoRouter = express.Router();

todoRouter.get(myroutes.getTodo, handleGetTodo);

todoRouter.get(myroutes.getAllTodo, handleGetAllTodo);

todoRouter.post(myroutes.createTodo, handleCreateTodo);

todoRouter.put(myroutes.updateTodo, handleUpdateTodo);

todoRouter.delete(myroutes.deleteTodo, handleDeletTodo);

export default todoRouter;

