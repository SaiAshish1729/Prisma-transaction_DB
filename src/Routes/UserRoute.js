const { Authentication } = require("../config/auth");
const controller = require("../controller/user")
const Joi = require('joi');
const { createUserValidation, loginUserValidation } = require("../validations/user");
const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

module.exports = [
    {
        method: 'POST',
        path: '/add-user',
        options: {
            tags: ['api', 'user'],
            handler: controller.createUser,
            description: "Add user details",
            validate: createUserValidation,
        }

    },
    {
        method: 'POST',
        path: '/login',
        options: {
            tags: ['api', 'user'],
            handler: controller.userLogin,
            description: "User Login",
            validate: loginUserValidation
        }

    },
]