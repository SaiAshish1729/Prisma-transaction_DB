const Joi = require('joi');

const createAssetPairValidation = {
    payload: Joi.object({
        asset_pair: Joi.string().required().label('asset_pair'),
    })
};

const paginationValidation = {
    query: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .label('page')
    })
};

module.exports = {
    createAssetPairValidation,
    paginationValidation
}