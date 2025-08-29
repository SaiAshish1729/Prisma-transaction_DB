const { balanceColumnMap } = require("../../example");
const prisma = require("../config/DbConfig");
const { ORDER_CATAGORY, ORDER_BOOK_STATUS, ORDER_TYPE } = require("../utills");

const creatOrder = async (req, h) => {
    try {
        const { asset_pair_id, quantity, currency, price, order_type, order_catagory } = req.payload;
        const user = req.rootUser;
        const userBalance = await prisma.balance.findFirst({
            where: {
                user_id: user.id
            }
        });
        const assetPairExist = await prisma.asset_Pair.findFirst({
            where: {
                id: asset_pair_id,
                deletedAt: null
            }
        })
        if (!assetPairExist) {
            return h.response({ message: "This asset pair does not exists" }).code(404);
        }
        console.log("userBalance:", userBalance)

        let balanceField;
        if (order_catagory === ORDER_CATAGORY.SELL) {
            const [base, quote] = assetPairExist.asset_pair.split("-");
            const column = balanceColumnMap[base];
            balanceField = column
            if (Number(quantity) > Number(userBalance[balanceField])) {
                return h.response({ message: `You don't have sufficient ${balanceField} balance to create this sell order.` }).code(400);
            }
            const newSellOrder = await prisma.orderBook.create({
                data: {
                    user_id: user.id,
                    asset_pair_id: asset_pair_id,
                    currency: base,
                    quantity: quantity,
                    price: price,
                    status: ORDER_BOOK_STATUS.OPEN,
                    order_catagory: ORDER_CATAGORY.SELL,
                    order_type: order_type,
                }
            });
            return h.response({ success: true, data: newSellOrder }).code(201);
        }

        if (order_catagory === ORDER_CATAGORY.BUY) {
            const [base, quote] = assetPairExist.asset_pair.split("-");
            console.log("quote:", quote);
            const column = balanceColumnMap[quote];
            let neededBalance = quantity * price;
            console.log("neededBalance:", neededBalance);
            balanceField = column;
            console.log("myBalance :", userBalance[balanceField])
            if (Number(neededBalance) > Number(userBalance[balanceField])) {
                return h.response({ message: `You don't have sufficient ${balanceField} balance to create this buy order.` }).code(400);
            }
            const newBuyOrder = await prisma.orderBook.create({
                data: {
                    user_id: user.id,
                    asset_pair_id: asset_pair_id,
                    currency: base,
                    quantity: quantity,
                    price: price,
                    status: ORDER_BOOK_STATUS.OPEN,
                    order_catagory: ORDER_CATAGORY.BUY,
                    order_type: order_type,
                }
            })
            return h.response({ success: true, data: newBuyOrder }).code(201);
        }

    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while order creation", error });
    }
}

const getOrderBookData = async (req, h) => {
    try {
        const orders = await prisma.orderBook.findMany({
            include: {
                asset_pair: {
                    select: {
                        id: true,
                        asset_pair: true,
                    }
                }
            }
        });
        return h.response({ success: true, data: orders }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while fetching orders", error });
    }
}


module.exports = {
    creatOrder,
    getOrderBookData,

}