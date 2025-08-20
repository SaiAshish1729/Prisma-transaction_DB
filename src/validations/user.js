const Joi = require('joi');

const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;
const createUserValidation = {
    payload: Joi.object({
        name: Joi.string().required().label('name'),
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
    })
};

const loginUserValidation = {
    payload: Joi.object({
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
    })
};
module.exports = {
    createUserValidation,
    loginUserValidation
}