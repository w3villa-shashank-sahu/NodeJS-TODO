import Joi from "joi";

export const signupValidator = Joi.object({
    name : Joi.string().min(3).max(25).required(),
    email: Joi.string().email().required(),
    password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
})

export const signinValidator = Joi.object({
    email: Joi.string().email().required(),
    password : Joi.string().min(6)
})

