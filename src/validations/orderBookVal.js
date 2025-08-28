const Joi = require('joi');
const { ORDER_TYPE } = require('../utills');

const createOrderValidation = {
    payload: Joi.object({
        asset_pair: Joi.string().required().label('asset_pair'),
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