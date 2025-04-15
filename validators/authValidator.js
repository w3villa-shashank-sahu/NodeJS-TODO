import Joi from "joi";

export const signupValidator = Joi.object({
    name : Joi.string().min(3).max(25).required().messages({
        'string.base': `"name" should be a type of 'text'`,
        'string.empty': `"name" cannot be an empty field`,
        'string.min': `"name" should have a minimum length of 3`,
        'string.max' : "max 25 char allowed",
        'any.required': `"name" is a required field`
      }),
    email: Joi.string().email().required(),

    //Has minimum 8 characters in length. Adjust it by modifying {8,}
    // At least one uppercase English letter. You can remove this condition by removing (?=.*?[A-Z])
    // At least one lowercase English letter.  You can remove this condition by removing (?=.*?[a-z])
    // At least one digit. You can remove this condition by removing (?=.*?[0-9])
    // At least one special character,  You can remove this condition by removing (?=.*?[#?!@$%^&*-])
    password : Joi.string().pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'))
})

export const signinValidator = Joi.object({
    email: Joi.string().email().required(),
    password : Joi.string().min(6).pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'))
})

