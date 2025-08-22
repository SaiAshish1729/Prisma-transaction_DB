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
            validate: {
                ...createUserValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },
        },
    },
    {
        method: 'POST',
        path: '/login',
        options: {
            tags: ['api', 'user'],
            handler: controller.userLogin,
            description: "User Login",
            validate: {
                ...loginUserValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },
        }

    },

    {
        method: 'GET',
        path: '/me',
        options: {
            tags: ['api', 'user'],
            description: "Profile",
            handler: controller.myProfile,
            pre: [Authentication],
        }

    },
]