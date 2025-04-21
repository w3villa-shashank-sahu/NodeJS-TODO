import authControllers from "../controllers/auth-controllers.js";
import userModal from "../model/user-modal.js";
import * as jwtUtils from "../utils/jwt.js";

describe('Auth Controller Tests', () => {
    // Setup for tests - create actual request and response objects
    function createRequest(body) {
        return { body };
    }

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

    test('handleSigninEmail successful login', async () => {
        // Actual implementation instead of mocks
        const req = createRequest({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        const res = createResponse();

        // Call the function with real objects
        await authControllers.handleSigninEmail(req, res);

        // Assertions with the actual response
        expect(res.statusCode).toBe(200);
        expect(res.jsonData.success).toBe(true);
        expect(res.jsonData.message).toBe('Signin successful');
        expect(res.jsonData.data).toHaveProperty('token');
        expect(res.cookieData.token).toBeDefined();
    });
});
