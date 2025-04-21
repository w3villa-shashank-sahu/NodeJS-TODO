import { expect } from 'chai';
import { describe, it, before, beforeEach, afterEach, after } from 'mocha';
import todoController from '../controllers/todo-controller.js';
import { init as initDatabase } from '../services/databaseService.js';
import todoModal from '../model/todo-modal.js';


const mockRequest = (body = {}, params = {}, originalUrl = '/mock/url') => ({
    body,
    params,
    originalUrl
});

const mockResponse = () => {
    const res = {
        statusCode: null,
        sentData: null,
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.sentData = data; }
    };
    return res;
};

before(async () => {
    await initDatabase();
});

describe('TodoController - handleCreateTodo', () => {
    // test 1
    it('should return 201 and the new todo on successful creation', async () => {
        const reqBody = { title: 'Create Test', description: 'Create Desc' };
        const req = mockRequest(reqBody);
        const res = mockResponse();

        await todoController.handleCreateTodo(req, res);

        expect(res.statusCode).to.equal(201);
        expect(res.sentData.success).to.be.true;
        expect(res.sentData.message).to.equal('Todo created successfully');
        expect(res.sentData.data).to.include({ title: reqBody.title, desc: reqBody.description, done: false });
        expect(res.sentData.data).to.have.property('id');
    });

    // test 2
    it('should return 400 if title is missing', async () => {
        const req = mockRequest({ description: 'Desc Only' });
        const res = mockResponse();
        await todoController.handleCreateTodo(req, res);
        expect(res.statusCode).to.equal(400);
        expect(res.sentData.success).to.be.false;
        expect(res.sentData.message).to.equal('Invalid data received. Title and description are required.');
    });

    // test 3
    it('should return 400 if description is missing', async () => {
        const req = mockRequest({ title: 'Title Only'});
        const res = mockResponse();
        await todoController.handleCreateTodo(req, res);
        expect(res.statusCode).to.equal(400);
        expect(res.sentData.success).to.be.false;
        expect(res.sentData.message).to.equal('Invalid data received. Title and description are required.');
    });
});


describe('TodoController - handleGetAllTodo', () => {
    // refresh new todos
    beforeEach(async () => {
        await todoModal.destroy({ where: {}, truncate: true });
        await todoModal.bulkCreate([
            { title: 'GetAll Test 1', desc: 'Desc 1' },
            { title: 'GetAll Test 2', desc: 'Desc 2' }
        ]);
        todoController.todosCache = []; // Clear cache before test
    });
    
    // delete all todos
    after(async () => {
        await todoModal.destroy({ where: {}, truncate: true }); // Clean up after suite
        todoController.todosCache = [];
    });

    // test 1
    it('should return 200 and an array of todos', async () => {
        const req = mockRequest();
        const res = mockResponse();
        await todoController.handleGetAllTodo(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res.sentData.success).to.be.true;
        expect(res.sentData.message).to.equal('Todos retrieved successfully');
        expect(res.sentData.data).to.be.an('array').with.lengthOf(2);
        expect(res.sentData.data[0].title).to.equal('GetAll Test 1');
        expect(res.sentData.data[1].title).to.equal('GetAll Test 2');
    });

    // test 2
    it('should return 200 and data from cache on second call', async () => {
        const req = mockRequest();
        const res1 = mockResponse();
        const res2 = mockResponse();

        // First call (populates cache)
        await todoController.handleGetAllTodo(req, res1);
        expect(res1.statusCode).to.equal(200);
        expect(res1.sentData.message).to.equal('Todos retrieved successfully');
        expect(todoController.todosCache).to.be.an('array').with.lengthOf(2); // Cache populated

        // Second call (should use cache)
        await todoController.handleGetAllTodo(req, res2);
        expect(res2.statusCode).to.equal(200);
        expect(res2.sentData.success).to.be.true;
        expect(res2.sentData.message).to.equal('Todos retrieved from cache'); // Message indicates cache hit
        expect(res2.sentData.data).to.be.an('array').with.lengthOf(2);
        expect(res2.sentData.data).to.deep.equal(todoController.todosCache); // Data matches cache
    });

    // test 3
    it('should return 200 and an empty array if no todos exist', async () => {
        await todoModal.destroy({ where: {}, truncate: true }); // Ensure no todos
        todoController.todosCache = []; // Clear cache
        const req = mockRequest();
        const res = mockResponse();
        await todoController.handleGetAllTodo(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res.sentData.success).to.be.true;
        expect(res.sentData.data).to.be.an('array').that.is.empty;
    });
});


describe('TodoController - handleDeletTodo', () => {
    let createdTodoId;

    beforeEach(async () => {
        const todo = await todoModal.create({ title: 'Delete Test', desc: 'Delete Desc' });
        createdTodoId = todo.id;
        todoController.todosCache = []; 
    });

    // test 1
    it('should return 200 on successful deletion', async () => {
        const req = mockRequest({}, { id: createdTodoId });
        const res = mockResponse();
        await todoController.handleDeletTodo(req, res);

        expect(res.statusCode).to.equal(200);
        expect(res.sentData.success).to.be.true;
        expect(res.sentData.message).to.equal('Todo deleted successfully');

        // Verify it's actually deleted
        const found = await todoModal.findByPk(createdTodoId);
        expect(found).to.be.null;
    });

    it('should return 404 if todo ID does not exist', async () => {
        const nonExistentId = createdTodoId + 999;
        const req = mockRequest({}, { id: nonExistentId });
        const res = mockResponse();
        await todoController.handleDeletTodo(req, res);
        expect(res.statusCode).to.equal(404);
        expect(res.sentData.success).to.be.false;
        expect(res.sentData.message).to.equal('Todo not found');
    });

    it('should return 400 if todo ID is missing in params', async () => {
        const req = mockRequest({}, {}); // No ID
        const res = mockResponse();
        await todoController.handleDeletTodo(req, res);
        expect(res.statusCode).to.equal(400);
        expect(res.sentData.success).to.be.false;
        expect(res.sentData.message).to.equal('Todo ID is required in parameters.');
    });
});


describe('TodoController - handleUpdateTodo', () => {
    let createdTodoId = 0;

    // refresh new todos
    beforeEach(async () => {
        await todoModal.destroy({ where: {}, truncate: true });
        const todo = await todoModal.create({ title: 'Delete Test', desc: 'Delete Desc' });
        createdTodoId = todo.id;
        todoController.todosCache = []; // Clear cache before test
    });

    // delete all todos
    after(async () => {
        await todoModal.destroy({ where: {}, truncate: true }); // Clean up after suite
        todoController.todosCache = [];
    });

    it('should return 200 response and update Todo data', async () => {
        let req = mockRequest({ done : true, title: "todo1 updated" }, {id : createdTodoId})
        let res = mockResponse()
        await todoController.handleUpdateTodo(req, res)
        
        expect(res.statusCode).to.be.equal(200)
        expect(res.sentData.data).to.an('Object')
        expect(res.sentData.success).to.be.true;
        expect(res.sentData.data.title).to.equal('todo1 updated')
        expect(res.sentData.data.done).equals(true)
        expect(res.sentData.message).equal('Todo updated successfully')
    })
});


