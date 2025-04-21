import { isAuth } from '../middleware/auth-middleware.js';
import AllowRole from '../middleware/autherization-middleware.js';
import {
  validateSignUpData,
  validateSignIn,
  validateCreateTodo,
  validateUpdateTodoBody,
  validateTodoIdParam,
} from '../middleware/dataValidation-middleware.js';
import * as UserModalModule from '../model/user-modal.js';
import * as JwtUtils from '../utils/jwt.js';
import * as WinstonUtils from '../utils/winston.js';
import * as ResponseUtils from '../utils/response.js';
import * as AuthValidators from '../validators/authValidator.js';
import * as TodoValidators from '../validators/todoValidator.js';

// --- Mocking ---
jest.mock('../validators/authValidator.js');
jest.mock('../validators/todoValidator.js');

const mocks = {
  mockUserFindOne: jest.fn(),
  mockVerifyToken: jest.fn(),
  mockLoggerInfo: jest.fn(),
  mockLoggerError: jest.fn(),
  mockSendError: jest.fn(),
};

if (UserModalModule.default) {
  UserModalModule.default.findOne = mocks.mockUserFindOne;
} else {
  console.error("Could not find default export for UserModalModule");
}

JwtUtils.verifyToken = mocks.mockVerifyToken;
WinstonUtils.logger = { info: mocks.mockLoggerInfo, error: mocks.mockLoggerError };
ResponseUtils.sendError = mocks.mockSendError;


// --- Test Suite ---
describe('Middleware Tests with jest.mock for Validators', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset manual mocks
    mocks.mockUserFindOne.mockClear();
    mocks.mockVerifyToken.mockClear();
    mocks.mockLoggerInfo.mockClear();
    mocks.mockLoggerError.mockClear();
    mocks.mockSendError.mockClear();
    // Reset mocks created by jest.mock
    AuthValidators.signupValidator.validate.mockClear();
    AuthValidators.signinValidator.validate.mockClear();
    TodoValidators.createTodoValidator.validate.mockClear();
    TodoValidators.updateTodoBodyValidator.validate.mockClear();
    TodoValidators.todoIdParamValidator.validate.mockClear();

    // Re-assign findOne (manual mock)
    if (UserModalModule.default) {
        UserModalModule.default.findOne = mocks.mockUserFindOne;
    }

    // Create fresh req/res/next
    req = {
      header: jest.fn(),
      body: {},
      params: {},
      email: undefined,
      role: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  // --- Auth Middleware: isAuth ---
  describe('isAuth Middleware', () => {
    test('should return 400 if no token is found', async () => {
      req.header.mockReturnValue(undefined);
      await isAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('No token found');
      expect(next).not.toHaveBeenCalled();
    });

    test.each([
        ['InvalidTokenFormat'],
        ['Bearer'], // Missing token part
    ])('should return 400 for invalid token format: %s', async (token) => {
        req.header.mockReturnValue(token);
        await isAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid token');
        expect(next).not.toHaveBeenCalled();
    });


    test.each([
        [{}], // No email/role
        [{ email: 'test@example.com' }], // Missing role
    ])('should return 400 if token verification fails with payload: %p', async (payload) => {
        req.header.mockReturnValue('Bearer validToken');
        mocks.mockVerifyToken.mockReturnValue(payload);
        await isAuth(req, res, next);
        expect(mocks.mockVerifyToken).toHaveBeenCalledWith('validToken');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid token');
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 400 if user is not found', async () => {
      req.header.mockReturnValue('Bearer validToken');
      mocks.mockVerifyToken.mockReturnValue({ email: 'test@example.com', role: 'user' });
      mocks.mockUserFindOne.mockResolvedValue(null);
      await isAuth(req, res, next);
      expect(mocks.mockUserFindOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Invalid token');
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 400 if user is logged out (empty authToken)', async () => {
      req.header.mockReturnValue('Bearer validToken');
      mocks.mockVerifyToken.mockReturnValue({ email: 'test@example.com', role: 'user' });
      const fakeUser = { dataValues: { authToken: [] } };
      mocks.mockUserFindOne.mockResolvedValue(fakeUser);
      await isAuth(req, res, next);
      expect(mocks.mockUserFindOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mocks.mockLoggerInfo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('User is Logged Out, SignIn Again');
      expect(next).not.toHaveBeenCalled();
    });

    test('should call next() and set req.email/req.role if token is valid and user is logged in', async () => {
      const email = 'test@example.com';
      const role = 'user';
      req.header.mockReturnValue('Bearer validToken');
      mocks.mockVerifyToken.mockReturnValue({ email, role });
      const fakeUser = { dataValues: { authToken: ['someAuthToken'] } };
      mocks.mockUserFindOne.mockResolvedValue(fakeUser);

      await isAuth(req, res, next);

      expect(mocks.mockVerifyToken).toHaveBeenCalledWith('validToken');
      expect(mocks.mockUserFindOne).toHaveBeenCalledWith({ where: { email } });
      expect(mocks.mockLoggerInfo).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(req.email).toBe(email);
      expect(req.role).toBe(role);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  // --- Authorization Middleware: AllowRole ---
  describe('AllowRole Middleware', () => {
    test('should call next() if user role is allowed', () => {
      const allowedUsers = ['admin', 'user'];
      req.role = 'admin';
      AllowRole(allowedUsers)(req, res, next);
      expect(mocks.mockSendError).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    test.each([
        [['admin'], 'user', 'user are not authorized to visit this route'], // Not allowed
        [[], 'anyRole', 'anyRole are not authorized to visit this route'], // Empty allowed list
    ])('should call sendError with 401 for allowed=%p, role=%s', (allowedUsers, role, expectedMessage) => {
        req.role = role;
        AllowRole(allowedUsers)(req, res, next);
        expect(mocks.mockSendError).toHaveBeenCalledWith(res, 401, 'Not authorized', { message: expectedMessage });
        expect(next).not.toHaveBeenCalled();
    });
  });

  // --- Data Validation Middleware ---
  describe('Data Validation Middlewares', () => {
    // Helper function for testing validation middlewares
    const testValidationMiddleware = ({
        middlewareFunction, // Pass the actual middleware function
        validatorObject, // Pass the imported (mocked) validator object
        dataSource = 'body',
        pathParams = null,
        validData,
        invalidData,
        errorMessage
    }) => {
        const middlewareInstance = middlewareFunction; // Use the actual middleware

        test('should call next() if validation passes', () => {
            // Set the return value on the mocked validator's validate method
            validatorObject.validate.mockReturnValue({ error: null });
            if (dataSource === 'body') req.body = validData;
            if (dataSource === 'params' || pathParams === 'params') req.params = validData;

            middlewareInstance(req, res, next);

            const expectedDataToValidate = {
                ...(req.body || {}),
                ...(req.params || {})
            };
             // Ensure the mocked validator's validate method was called
            expect(validatorObject.validate).toHaveBeenCalledWith(expectedDataToValidate);
            expect(mocks.mockSendError).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
        });

        test('should call sendError with 400 if validation fails', () => {
            const validationError = { details: [{ message: errorMessage }] };
            // Set the return value on the mocked validator's validate method
            validatorObject.validate.mockReturnValue({ error: validationError });
             if (dataSource === 'body') req.body = invalidData;
             if (dataSource === 'params' || pathParams === 'params') req.params = invalidData;

            middlewareInstance(req, res, next);

            const expectedDataToValidate = {
                ...(req.body || {}),
                ...(req.params || {})
            };
            // Ensure the mocked validator's validate method was called
            expect(validatorObject.validate).toHaveBeenCalledWith(expectedDataToValidate);
            expect(mocks.mockSendError).toHaveBeenCalledWith(res, 400, 'validation failed', errorMessage);
            expect(next).not.toHaveBeenCalled();
        });
    };

    describe('validateSignUpData', () => {
        testValidationMiddleware({
            middlewareFunction: validateSignUpData,
            validatorObject: AuthValidators.signupValidator, // Pass the mocked validator object
            validData: { username: 'test', password: 'password' },
            invalidData: { username: 'invalid' },
            errorMessage: 'Signup validation failed'
        });
    });

    describe('validateSignIn', () => {
        testValidationMiddleware({
            middlewareFunction: validateSignIn,
            validatorObject: AuthValidators.signinValidator, // Pass the mocked validator object
            validData: { email: 'test@test.com', password: 'password' },
            invalidData: { email: 'invalid' },
            errorMessage: 'Signin validation failed'
        });
    });

     describe('validateCreateTodo', () => {
        testValidationMiddleware({
            middlewareFunction: validateCreateTodo,
            validatorObject: TodoValidators.createTodoValidator, // Pass the mocked validator object
            validData: { title: 'New Todo', description: 'Details' },
            invalidData: { title: '' },
            errorMessage: 'CreateTodo validation failed'
        });
    });

     describe('validateUpdateTodoBody', () => {
        testValidationMiddleware({
            middlewareFunction: validateUpdateTodoBody,
            validatorObject: TodoValidators.updateTodoBodyValidator, // Pass the mocked validator object
            validData: { title: 'Updated Todo' },
            invalidData: { status: 'invalidStatus' },
            errorMessage: 'UpdateTodo validation failed'
        });
    });

     describe('validateTodoIdParam', () => {
        testValidationMiddleware({
            middlewareFunction: validateTodoIdParam,
            validatorObject: TodoValidators.todoIdParamValidator, // Pass the mocked validator object
            dataSource: 'params',
            pathParams: 'params',
            validData: { id: 'validMongoIdLookingString12345' },
            invalidData: { id: 'invalid-id' },
            errorMessage: 'TodoId validation failed'
        });
    });
  });
});
