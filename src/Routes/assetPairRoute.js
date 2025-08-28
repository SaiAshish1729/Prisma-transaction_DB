const controller = require("../controller/assetPair")
const Joi = require('joi');
const { createAssetPairValidation } = require("../validations/assetPairValidation");

module.exports = [
    {
        method: 'POST',
        path: '/add-asset-pair',
        options: {
            tags: ['api', 'Asset_Pair'],
            handler: controller.createAssetPair,
            description: "Add Asset Pair",
            validate: {
                ...createAssetPairValidation,
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
        method: 'POST',
        path: '/all-asset-pairs',
        options: {
            tags: ['api', 'Asset_Pair'],
            handler: controller.allAssetPairs,
            description: "All Asset Pairs",
        },
    },

]