const Joi = require('joi')

const registerValidation = (data)=>{
    const schema = Joi.object({
        name:Joi.string().min(3).required().messages({"string.min": `Name should have a minimum length of 3`,"any.required": `Name is required`,}),
        email: Joi.string().min(6).required().email().messages({"string.min": `Email should have a minimum length of 6`,"any.required": `Email is required`,}),
        password: Joi.string().min(6).required().messages({"any.required": `Password is required`,})
    })
    return schema.validate(data)
}

const loginValidation = (data)=>{
    const schema = Joi.object({
       email: Joi.string().min(6).required().email(),
       password: Joi.string().min(6).required(),
       rem:Joi.boolean()
   })
   return schema.validate(data);
}

const passwordValidation = (data)=>{
    const schema = Joi.object({
        token:Joi.string().min(10).required().messages({"string.min": `Invalid token`,}),
        password:Joi.string().min(6).required().messages({"string.min": `Password must have at least 6 characters`,})
    })
    return schema.validate(data)
}
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.passwordValidation = passwordValidation