import todoModal from "../model/todo-modal.js";

export async function handleCreateTodo(req, res) {
    try {
        const title = req.body.title;
        const description = req.body.description;

        if(!title || !description){
            res.status(400).json({message: 'Invalid data recieved'})
            return;
        }

        const newtodo = await todoModal.create({title: title, desc: description})
        console.log('new todo: ', newtodo);
        

        if(!newtodo){
            res.status(500).json({message: 'failed to create todo'})
        }

        res.status(200).json(newtodo.toJSON())
    } catch (error) {
        res.status(500).json({message: `unexpected error occour: ${error}`})
    }
}

export async function handleUpdateTodo(req, res) {
    try {
        const id = req.params.id;
        const { title, description, done } = req.body;

        if (!id) {
            res.status(400).json({ message: 'Todo ID is required' });
            return;
        }

        const todo = await todoModal.findByPk(id);

        if (!todo) {
            res.status(404).json({ message: 'Todo not found' });
            return;
        }

        // Update only the fields that are provided
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.desc = description;
        if (done !== undefined) updateData.done = done;

        await todo.update(updateData);
        
        res.status(200).json({ message: 'Todo updated successfully', todo });
    } catch (error) {
        res.status(500).json({ message: `Unexpected error occurred: ${error}` });
    }
}

export async function handleGetTodo(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(400).json({ message: 'Todo ID is required' });
            return;
        }

        const todo = await todoModal.findByPk(id);

        if (!todo) {
            res.status(404).json({ message: 'Todo not found' });
            return;
        }

        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json({ message: `Unexpected error occurred: ${error}` });
    }
}

export async function handleGetAllTodo(req, res) {
    try {
        const todos = await todoModal.findAll();
        
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: `Unexpected error occurred: ${error}` });
    }
}

export async function handleDeletTodo(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(400).json({ message: 'Todo ID is required' });
            return;
        }

        const todo = await todoModal.findByPk(id);

        if (!todo) {
            res.status(404).json({ message: 'Todo not found' });
            return;
        }

        await todo.destroy();
        
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Unexpected error occurred: ${error}` });
    }
}