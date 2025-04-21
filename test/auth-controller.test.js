import userModal from "../model/user-modal.js";
import authControllers from "../controllers/auth-controllers.js";
import { init as initDatabase } from "../services/databaseService.js";

// createResponse remains as it's useful for mocking
function createResponse() {
    const res = {
        statusCode: null,
        cookieData: {},
        jsonData: null,
        cookie: function (name, value, options) {
            this.cookieData[name] = { value, options };
            return this;
        },
        status: function (code) {
            this.statusCode = code;
            return this;
        },
        json: function (data) {
            this.jsonData = data;
            return this;
        }
    };
    return res;
}

beforeAll(async () => {
    await initDatabase();
});


describe('Auth Controller Tests', () => {
    // Common setup for all auth tests

    beforeEach(async () => {
        // Clean up database before each test
        await userModal.destroy({ where: {}, truncate: true });
        
        // Create a standard test user for use in multiple tests
        await userModal.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            authToken: '' // Initially no token
        });
    });

    afterEach(async () => {
        // Clean up database after each test
        await userModal.destroy({ where: {}, truncate: true });
    });

    // --- Tests for handleSigninEmail ---
    describe('handleSigninEmail', () => {
        test('should login successfully with valid credentials', async () => {
            const req = { 
                body: {
                    // name: 'Test User', // Name is not required/used for signin
                    email: 'test@example.com',
                    password: 'password123',
                }
            };
            const res = createResponse();
        
            await authControllers.handleSigninEmail(req, res);
            
            expect(res.statusCode).toBe(200);
            expect(res.jsonData.success).toBe(true);
            expect(res.jsonData.message).toBe('Signin successful');
            expect(res.jsonData.data).toHaveProperty('token');
            expect(res.cookieData.token).toBeDefined(); // Check if cookie was set
        });

        test('should fail with invalid credentials', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'wrongpassword' // Incorrect password
                }
            };
            const res = createResponse();

            await authControllers.handleSigninEmail(req, res);

            expect(res.statusCode).toBe(401);
            expect(res.jsonData.success).toBe(false);
            expect(res.jsonData.message).toBe('Invalid password');
        });

        test('should fail with non-existent user', async () => {
            const req = {
                body: {
                    email: 'nonexistent@example.com', // User does not exist
                    password: 'password123'
                }
            };
            const res = createResponse();

            await authControllers.handleSigninEmail(req, res);
            
            expect(res.statusCode).toBe(404);
            expect(res.jsonData.success).toBe(false);
            expect(res.jsonData.message).toBe('User not found');
        });

        test('should fail with missing email (controller behavior)', async () => {
            const req = {
                body: {
                    password: 'password123'
                    // email field is missing
                }
            };
            const res = createResponse();

            await authControllers.handleSigninEmail(req, res);

            // Asserting the controller's direct behavior without middleware validation
            // The controller finds no user with email: undefined
            expect(res.statusCode).toBe(404); 
            expect(res.jsonData.success).toBe(false);
            expect(res.jsonData.message).toBe('User not found'); 
        });
    }); 

    // --- Tests for handleSignupwithEmail ---
    describe('handleSignupwithEmail', () => {
        test('should create a new user successfully', async () => {
            const req = {
                body: {
                    name: 'New User',
                    email: 'new@example.com', // New email
                    password: 'newpassword123'
                }
            };
            const res = createResponse();

            await authControllers.handleSignupwithEmail(req, res);

            expect(res.statusCode).toBe(201);
            expect(res.jsonData.success).toBe(true);
            expect(res.jsonData.message).toBe('User created successfully');
            expect(res.jsonData.data).toHaveProperty('token');
            expect(res.cookieData.token).toBeDefined(); // Check if cookie was set

            // Verify user was actually created in the database
            const user = await userModal.findOne({ where: { email: 'new@example.com' } });
            expect(user).not.toBeNull();
            expect(user.name).toBe('New User');
            expect(user.email).toBe('new@example.com');
        });

        test('should fail if user already exists', async () => {
            const req = {
                body: {
                    name: 'Another Test User', 
                    email: 'test@example.com', // Email already exists (from beforeEach)
                    password: 'password123'
                }
            };
            const res = createResponse();

            await authControllers.handleSignupwithEmail(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.jsonData.success).toBe(false);
            expect(res.jsonData.message).toBe('User Already exists');
        });
    }); 
    
    // --- Tests for handleLogout ---
    describe('handleLogout', () => {
        test('should log out an existing user successfully', async () => {
            const userEmail = 'test@example.com';
            // Give the user a token first (simulate being logged in)
            await userModal.update({ authToken: 'some-active-token' }, { where: { email: userEmail } });

            // Simulate request where middleware would have added req.email
            const req = { 
                body: {}, // Logout doesn't use the body
                email: userEmail // This property is expected by the controller
            }; 
            const res = createResponse();

            await authControllers.handleLogout(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.jsonData.success).toBe(true);
            expect(res.jsonData.message).toBe('Logout successful');

            // Verify the token is cleared in the database
            const user = await userModal.findOne({ where: { email: userEmail } });
            expect(user).not.toBeNull();
            expect(user.authToken).toBe(''); // Check if token is empty string after logout
        });

        test('should fail if user not found or already logged out', async () => {
            // Simulate request for a user email that doesn't exist
            const req = { 
                body: {},
                email: 'nonexistent@example.com' 
            }; 
            const res = createResponse();

            await authControllers.handleLogout(req, res);

            expect(res.statusCode).toBe(404);
            expect(res.jsonData.success).toBe(false);
            expect(res.jsonData.message).toBe('User not found or already logged out');
        });

         test('should handle logout even if user token was already empty', async () => {
            // User exists but token is already empty (as created in beforeEach)
            const userEmail = 'test@example.com';
             const userBefore = await userModal.findOne({ where: { email: userEmail } });
             expect(userBefore.authToken).toBe(''); // Confirm token is initially empty

            const req = { 
                body: {},
                email: userEmail 
            }; 
            const res = createResponse();

            await authControllers.handleLogout(req, res);

            // The controller finds the user but update affects 0 rows if token is already ''
            // The current controller logic returns 404 in this case.
            expect(res.statusCode).toBe(404); 
            expect(res.jsonData.success).toBe(false);
            expect(res.jsonData.message).toBe('User not found or already logged out');
        });
    }); 

});

// realworld.io
