const prisma = require("../config/DbConfig")

const createAssetPair = async (req, h) => {
    try {
        const { asset_pair } = req.payload;
        const newPair = await prisma.asset_Pair.create({
            data: {
                asset_pair
            }
        });
        return h.response({ success: true, data: newPair }).code(201);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Serevr error while creating asset_pair", error }).code(500);
    }
}

const allAssetPairs = async (req, h) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 100;
        const skip = (page - 1) * limit;

        const total = await prisma.asset_Pair.count();

        const allPairs = await prisma.asset_Pair.findMany({
            skip: skip,
            take: limit,
            orderBy: { id: "asc" }
        });

        return h.response({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: allPairs
        })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Server error while fetching asset_pair", error })
            .code(500);
    }
};


module.exports = {
    createAssetPair,
    allAssetPairs
}