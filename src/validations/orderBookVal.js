const Joi = require('joi');
const { ORDER_TYPE } = require('../utills');

const JoiBigInt = Joi.extend((joi) => ({
    type: "bigint",
    base: joi.any(),
    messages: {
        "bigint.base": "{{#label}} must be a valid bigint",
    },
    coerce(value, helpers) {
        // Handle numbers or strings
        try {
            if (typeof value === "number") {
                return { value: BigInt(value.toString()) };
            }
            if (typeof value === "string" && /^\d+$/.test(value)) {
                return { value: BigInt(value) };
            }
            return { errors: helpers.error("bigint.base") };
        } catch {
            return { errors: helpers.error("bigint.base") };
        }
    },
}));



const createOrderValidation = {
    payload: Joi.object({
        // asset_pair_id: Joi.number().required().label('asset_pair_id'),
        asset_pair_id: JoiBigInt.bigint().required().label("asset_pair_id"),
        quantity: Joi.string().required().label('quantity'),
        currency: Joi.string().required().label('currency'),
        price: Joi.string().required().label('price'),
        order_catagory: Joi.string().optional().allow("").label('order_catagory'),
        order_type: Joi.string().required().allow(ORDER_TYPE.LIMIT, ORDER_TYPE.MARKET).label('order_type')
    })
};

const fetchOrdersValidation = {
    payload: Joi.object({
        asset_pair: Joi.string().required().label('asset_pair'),
        quantity: Joi.string().required().label('quantity'),
        currency: Joi.string().required().label('currency'),
        price: Joi.string().required().label('price'),
        order_catagory: Joi.string().optional().allow("").label('order_catagory'),
        order_type: Joi.string().required().allow(ORDER_TYPE.LIMIT, ORDER_TYPE.MARKET).label('order_type')
    })
};
module.exports = {
    createOrderValidation,
    // fetchOrdersValidation,
}