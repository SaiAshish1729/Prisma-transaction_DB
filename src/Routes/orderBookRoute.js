const { Authentication } = require("../config/auth");
const controller = require("../controller/orderBook")
const Joi = require('joi');
const { createOrderValidation } = require("../validations/orderBookVal");
const { paginationValidation } = require("../validations/assetPairValidation");


module.exports = [
    {
        method: 'POST',
        path: '/handle-order',
        options: {
            tags: ['api', 'OrderBook'],
            handler: controller.creatOrder,
            description: "Buy or sale order",
            pre: [Authentication],
            validate: {
                ...createOrderValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h.response({ statusCode: 400, error: "Bad Request", message: customErrorMessages, }).code(400).takeover();
                },
            },
        },
    },

    {
        method: 'get',
        path: '/get-all-orders',
        options: {
            tags: ['api', 'OrderBook'],
            handler: controller.getOrderBookData,
            description: "Fetch All orders",
            validate: {
                ...paginationValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h.response({ statusCode: 400, error: "Bad Request", message: customErrorMessages, }).code(400).takeover();
                },
            },
        },
    },
]