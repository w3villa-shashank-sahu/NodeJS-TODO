import { signupValidator, signinValidator } from "../validators/authValidator.js";
import { createTodoValidator, updateTodoBodyValidator, todoIdParamValidator } from "../validators/todoValidator.js";
import { sendError } from "../utils/response.js";

function createValidationMiddleware(joiObject, dataSource='body', pathParams){
    return (req, res, next) => {
        let data = { 
            ...(req[dataSource] || {}), 
            ...(pathParams ? (req[pathParams] || {}) : {})
        }
        const {error} = joiObject.validate(data)
        if(error)
            return sendError(res, 400, 'validation failed', error.details[0].message)
        next();
    }
}


export const validateSignUpData = createValidationMiddleware(signupValidator) 
export const validateSignIn = createValidationMiddleware(signinValidator)
// --- Todo Validation Middleware ---
export const validateCreateTodo = createValidationMiddleware(createTodoValidator)
export const validateUpdateTodoBody = createValidationMiddleware(updateTodoBodyValidator)
export const validateTodoIdParam = createValidationMiddleware(todoIdParamValidator, '', 'params')