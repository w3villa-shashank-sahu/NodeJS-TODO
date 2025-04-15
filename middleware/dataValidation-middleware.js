import { signupValidator, signinValidator } from "../validators/authValidator.js";
import { createTodoValidator, updateTodoBodyValidator, todoIdParamValidator } from "../validators/todoValidator.js";
import { logger, logError } from "../utils/winston.js";
import { sendError } from "../utils/response.js";
import { verifyToken } from "../utils/jwt.js";

export function validateSignUpData(req, res, next) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const {error, _} = signupValidator.validate({name, email, password})

    if(error){
        return sendError(res, 400, "Validation failed", error.details[0].message);
    }

    next();
}

export function validateSignIn(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    // logger.info('email: ', email);

    const {error, _} = signinValidator.validate({email: email, password: password})

    logger.info('error: ', error);

    
    if(error){
        return sendError(res, 400, "Validation failed", error.details[0].message);
    }

    next()
}

export function validateLogout(req, res, next) {
    logger.info('header ', req.header('authorization'));
    
    const authHeader = req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'Authorization header missing or invalid format');
    }

    let token = authHeader.split(' ')[1];
    let emailPayload;
    try {
        emailPayload = verifyToken(token);
        if (!emailPayload || !emailPayload.email) {
            return sendError(res, 401, 'Invalid or expired token');
        }
    } catch (err) {
        logError({error, functionName : 'handleGetAllTodo',route: req.originalUrl })
        return sendError(res, 401, 'Invalid or expired token');
    }

    logger.info('email: ', emailPayload.email);
    // adding email in the request object
    req.email = emailPayload.email;
    next()
}

// --- Todo Validation Middleware ---
export function validateCreateTodo(req, res, next) {
    const { title, description } = req.body;
    const { error } = createTodoValidator.validate({ title, description });

    if (error) {
        return sendError(res, 400, "Validation failed for creating todo", error.details[0].message);
    }

    next();
}

export function validateUpdateTodoBody(req, res, next) {
    const { title, description, completed } = req.body;
    const { error } = updateTodoBodyValidator.validate({ title, description, completed });

    if (error) {
        return sendError(res, 400, "Validation failed for updating todo body", error.details[0].message);
    }

    next();
}

export function validateTodoIdParam(req, res, next) {
    const { id } = req.params;
    const { error } = todoIdParamValidator.validate({ id });

    if (error) {
        return sendError(res, 400, "Validation failed for todo ID parameter", error.details[0].message);
    }

    next();
}
