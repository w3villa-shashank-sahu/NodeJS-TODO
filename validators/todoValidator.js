import Joi from 'joi';

export const createTodoValidator = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(200).optional(),
});

export const updateTodoBodyValidator = Joi.object({
    title: Joi.string().min(3).max(50).optional(),
    description: Joi.string().max(200).optional(),
    done: Joi.boolean().optional(),

}).min(1); 

export const todoIdParamValidator = Joi.object({
    id: Joi.number().required() 
});
