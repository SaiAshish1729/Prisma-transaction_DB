const Joi = require('joi');

const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;
const createUserValidation = {
    payload: Joi.object({
        name: Joi.string().required().label('name'),
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
        // eth_balance: Joi.string().optional().allow("").label('eth_balance'),
        // usd_balance: Joi.string().required().label('usd_balance'),
        // kanch_balance: Joi.string().required().label('kanch_balance')
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