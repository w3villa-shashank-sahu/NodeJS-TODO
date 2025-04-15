import todoModal from "../model/todo-modal.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {logger, logError} from "../utils/winston.js"

export async function handleCreateTodo(req, res) {
    try {
        const title = req.body.title;
        const description = req.body.description;

        if (!title || !description) {
            return sendError(res, 400, 'Invalid data received. Title and description are required.', []);
        }

        const newtodo = await todoModal.create({ title: title, desc: description });
        logger.info('new todo: ', newtodo);

        if (!newtodo) {
            // This case might be redundant if create throws an error, but kept for safety
            return sendError(res, 500, 'Failed to create todo', []);
        }

        return sendSuccess(res, 201, 'Todo created successfully', newtodo.toJSON());
    } catch (error) {
        logError({
            error,
            functionName: 'handleCreateTodo',
            route: req.originalUrl
          });
        return sendError(res, 500, 'Unexpected error occurred during todo creation', error.message);
    }
}

export async function handleUpdateTodo(req, res) {
    try {
        const id = req.params.id;
        const { title, description, done } = req.body;

        if (!id) {
            return sendError(res, 400, 'Todo ID is required in parameters.');
        }

        const todo = await todoModal.findByPk(id);

        if (!todo) {
            return sendError(res, 404, 'Todo not found');
        }

        // Update only the fields that are provided
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.desc = description;
        if (done !== undefined) updateData.done = done;
        // updateData.abc = 'abc' 

        logger.info(Object.keys(updateData).length);
        

        if(Object.keys(updateData) == 0){
            return sendError(res, 400, 'No field matched to be update!')
        }

        const updatedRows = await todo.update(updateData); // update returns [numberOfAffectedRows]
        // logger.info('updated data: ', updatedRows);
        
        
        // Optionally check if rows were actually updated, though findByPk should ensure it exists
        if (updatedRows) {
            return sendSuccess(res, 200, 'Todo updated successfully', todo.toJSON()); // Return updated todo
        } else {
             // This case might indicate no changes were made or an issue
            return sendError(res, 500, 'Failed to update todo or no changes made');
        }
    } catch (error) {
        logError({error, functionName : 'handleUpdateTodo',route: req.originalUrl })
        return sendError(res, 500, 'Unexpected error occurred during todo update', error.message);
    }
}

export async function handleGetTodo(req, res) {
    let stack = "todo-controller.js, handleGetTodo()"
    try {
        const id = req.params.id;

        if (!id) {
            return sendError(res, 400, 'Todo ID is required in parameters.', stack);
        }

        const todo = await todoModal.findByPk(id);

        if (!todo) {
            return sendError(res, 404, 'Todo not found', []);
        }

        return sendSuccess(res, 200, 'Todo retrieved successfully', todo.toJSON());
    } catch (error) {
        logError({error, functionName : 'handleGetTodo',route: req.originalUrl })
        return sendError(res, 500, 'Unexpected error occurred while retrieving todo', error.message, error.stack);
    }
}

export async function handleGetAllTodo(req, res) {
    logger.info('Entering handleGetAllTodo'); // Added log
    try {
        logger.info('Calling todoModal.findAll()'); // Added log
        const todos = await todoModal.findAll();
        logger.info(`Found ${todos ? todos.length : 0} todos`); // Added log

        return sendSuccess(res, 200, 'Todos retrieved successfully', todos.map(t => t.toJSON()));
    } catch (error) {
        logError({error, functionName : 'handleGetAllTodo',route: req.originalUrl })
        logger.error(`Get All Todos Error: ${error.message}`); // Added console log for error
        return sendError(res, 500, 'Unexpected error occurred while retrieving all todos', error.message, error.stack); // Added stack trace here too
    }
}

export async function handleDeletTodo(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return sendError(res, 400, 'Todo ID is required in parameters.');
        }

        const todo = await todoModal.findByPk(id);

        if (!todo) {
            return sendError(res, 404, 'Todo not found');
        }

        await todo.destroy();

        return sendSuccess(res, 200, 'Todo deleted successfully');
    } catch (error) {
        logError({error, functionName : 'handleDeletTodo',route: req.originalUrl })
        return sendError(res, 500, 'Unexpected error occurred during todo deletion', error.message);
    }
}
