const prisma = require("../config/DbConfig");
const { ORDER_CATAGORY, ORDER_BOOK_STATUS } = require("../utills");

const creatOrder = async (req, h) => {
    try {
        const user = req.rootUser;
        const { asset_pair, quantity, currency, price, order_type } = req.payload;

        let balanceField;
        // if (ORDER_CATAGORY == ORDER_CATAGORY.SELL) {
        //     if (currency === "ETH") {
        //         balanceField = "eth_balance";
        //         if (Number(quantity) > Number(user.eth_balance)) {
        //             return res.status(400).send({ message: `You don't have sufficient ETH balance to create this sell order.` });
        //         }
        //     } else if (currency === "USD") {
        //         balanceField = "usd_balance";
        //         if (Number(quantity) > Number(user.usd_balance)) {
        //             return res.status(400).send({ message: `You don't have sufficient USD balance to create this sell order.` });
        //         }
        //     } else if (currency === "KNCH") {
        //         balanceField = "kanch_balance";
        //         if (Number(quantity) > Number(user.kanch_balance)) {
        //             return res.status(400).send({ message: `You don't have sufficient KNCH balance to create this sell order.` });
        //         }
        //     }


        //     else {
        //         return h.response({ success: false, message: "Only USD ETH and KNCH are allowed." }).code(403);
        //     }

        //     // new sell oredr 
        //     const newSellOrder = await prisma.orderBook.create({
        //         data: {
        //             // seller_id: user.id,
        //             seller_id: BigInt(user.id),
        //             asset_pair,
        //             quantity,
        //             currency,
        //             price,
        //             order_catagory: ORDER_CATAGORY.SELL,
        //             order_type,
        //             status: ORDER_BOOK_STATUS.PENDING
        //         }
        //     });
        //     return h.response({ message: "Sell order created successfull.", data: newSellOrder }).code(201);


        // }

        if (ORDER_CATAGORY.SELL) {
            console.log(asset_pair);
            const [base, quote] = asset_pair.split("-");
            console.log(base);
        }
        return h.response({ message: "Testing..." }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while order creation", error });
    }
}

const getOrderBookData = async (req, h) => {
    try {
        const orders = await prisma.orderBook.findMany({
            include: {
                asset_pair: true,
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