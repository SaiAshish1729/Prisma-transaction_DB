const Joi = require('joi');

const createAssetPairValidation = {
    payload: Joi.object({
        asset_pair: Joi.string().required().label('asset_pair'),
    })
};


module.exports = {
    createAssetPairValidation,
}