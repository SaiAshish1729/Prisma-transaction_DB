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
        });
        if (!assetPairExist) {
            return h.response({ message: "This asset pair does not exists" }).code(404);
        }

        const [base, quote] = assetPairExist.asset_pair.split("-");
        let balances = { ...userBalance.balances };

        if (order_catagory === ORDER_CATAGORY.SELL) {
            if (Number(quantity) > Number(balances[base])) {
                return h.response({ message: `You don't have sufficient ${base} balance to create this sell order.` }).code(400);
            }
            // 1️ Create SELL order
            let newSellOrder = await prisma.orderBook.create({
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
            // store centralize balance
            // let totalDeposit = quantity * price;
            let totalDeposit = quantity;
            const deductBalance = await prisma.balance.update({
                where: { id: userBalance.id, user_id: user.id },
                data: {
                    balances: {
                        ...balances,
                        [base]: Number(balances[base]) - totalDeposit
                    }
                }
            });
            // find user in centralize table
            const userInCentralizeBalance = await prisma.centralizeBalance.findFirst({
                where: { user_id: user.id }
            });
            if (!userInCentralizeBalance) {
                const depositedBalance = await prisma.centralizeBalance.create({
                    data: {
                        user_id: user.id,
                        balance: {
                            [base]: totalDeposit
                        },
                    }
                });
            } else {
                const depositedBalance = await prisma.centralizeBalance.update({
                    where: { id: userInCentralizeBalance.id, user_id: user.id },
                    data: {
                        user_id: user.id,
                        balance: {
                            ...userInCentralizeBalance.balance,
                            [base]: totalDeposit
                        },
                    }
                });
            }

            // 2️ Find best BUY order (highest price, open, matching asset_pair)
            const bestBuyOrder = await prisma.orderBook.findFirst({
                where: {
                    asset_pair_id: asset_pair_id,
                    order_catagory: ORDER_CATAGORY.BUY,
                    status: ORDER_BOOK_STATUS.OPEN,
                    price: { gte: newSellOrder.price },
                    user_id: { not: user.id }
                },
                orderBy: { price: "desc" }
            });
            // console.log("bestBuyOrder:", bestBuyOrder);

            if (!bestBuyOrder) {
                return h.response({ success: true, data: newSellOrder }).code(201);
            }

            // 3️ Determine matched quantity
            const matchedQty = Math.min(newSellOrder.quantity, bestBuyOrder.quantity);

            // 4️ Run transaction to update everything atomically
            const result = await prisma.$transaction(async (tx) => {
                // --- Seller balance update (deduct base asset) ---
                const sellerCentralizeBalance = await tx.centralizeBalance.findFirst({
                    where: { user_id: newSellOrder.user_id }
                });

                await tx.centralizeBalance.update({
                    where: { id: sellerCentralizeBalance.id, user_id: newSellOrder.user_id },
                    data: {
                        balance: {
                            ...sellerCentralizeBalance.balance,
                            [base]: Number(balances[base]) - matchedQty,
                            [quote]: Number(balances[quote]) + matchedQty * newSellOrder.price
                        }
                    }
                });

                // --- Update SELL orderbook ---
                const updatedSellOrder = await tx.orderBook.update({
                    where: { id: newSellOrder.id },
                    data: {
                        quantity: (newSellOrder.quantity - matchedQty).toString(),
                        status: newSellOrder.quantity - matchedQty === 0
                            ? ORDER_BOOK_STATUS.COMPLETED
                            : ORDER_BOOK_STATUS.OPEN
                    }
                });

                // --- Buyer balance update (deduct quote asset = price * qty) ---
                const buyerBalance = await tx.centralizeBalance.findFirst({
                    where: { user_id: bestBuyOrder.user_id }
                });

                await tx.balance.update({
                    where: { user_id: bestBuyOrder.user_id },
                    data: {
                        balances: {
                            ...buyerBalance.balance,
                            [quote]: Number(buyerBalance.balance[quote]) - (matchedQty * newSellOrder.price),
                            [base]: Number(buyerBalance.balance[base]) + (matchedQty * newSellOrder.price)
                        }
                    }
                });

                // --- Update BUY orderbook ---
                await tx.orderBook.update({
                    where: { id: bestBuyOrder.id },
                    data: {
                        quantity: (bestBuyOrder.quantity - matchedQty).toString(),
                        status: bestBuyOrder.quantity - matchedQty === 0
                            ? ORDER_BOOK_STATUS.COMPLETED
                            : ORDER_BOOK_STATUS.OPEN
                    }
                });

                // --- Create Transaction record for seller ---
                await tx.transaction.create({
                    data: {
                        user_id: newSellOrder.user_id,
                        orderBook_id: newSellOrder.id,
                        asset_pair: (newSellOrder.asset_pair_id).toString(),
                        amount: String(matchedQty * newSellOrder.price),
                        offerPrice: String(bestBuyOrder.price),
                        tradePrice: String(newSellOrder.price),
                        quantity: String(matchedQty),
                        orderType: ORDER_CATAGORY.SELL
                    }
                });

                // --- Create Transaction record for buyer ---
                await tx.transaction.create({
                    data: {
                        user_id: bestBuyOrder.user_id,
                        orderBook_id: bestBuyOrder.id,
                        asset_pair: (newSellOrder.asset_pair_id).toString(),
                        amount: String(matchedQty * newSellOrder.price),
                        offerPrice: String(bestBuyOrder.price),
                        tradePrice: String(newSellOrder.price),
                        quantity: String(matchedQty),
                        orderType: ORDER_CATAGORY.BUY
                    }
                });

                return updatedSellOrder;
            });

            return h.response({ success: true, data: result }).code(201);
        }

        if (order_catagory === ORDER_CATAGORY.BUY) {
            let neededBalance = quantity * price;

            if (Number(neededBalance) > Number(balances[quote])) {
                return h.response({ message: `You don't have sufficient ${quote} balance to create this buy order.` }).code(400);
            }

            // 1️ Deduct quote from user's balance (lock funds)
            const deductBalance = await prisma.balance.update({
                where: { id: userBalance.id, user_id: user.id },
                data: {
                    balances: {
                        ...balances,
                        [quote]: Number(balances[quote]) - neededBalance
                    }
                }
            });

            // 2️ Store locked funds in centralizeBalance
            const userInCentralizeBalance = await prisma.centralizeBalance.findFirst({
                where: { user_id: user.id }
            });
            if (!userInCentralizeBalance) {
                const depositedBalance = await prisma.centralizeBalance.create({
                    data: {
                        user_id: user.id,
                        balance: {
                            [quote]: neededBalance
                        },
                    }
                });
            } else {
                const depositedBalance = await prisma.centralizeBalance.update({
                    where: { id: userInCentralizeBalance.id, user_id: user.id, },
                    data: {
                        user_id: user.id,
                        balance: {
                            [quote]: neededBalance
                        },
                    }
                });
            }


            // 3️ Create BUY order
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
            });

            // 4️ Find best SELL order (lowest price)
            const bestSellOrder = await prisma.orderBook.findFirst({
                where: {
                    asset_pair_id: asset_pair_id,
                    order_catagory: ORDER_CATAGORY.SELL,
                    status: ORDER_BOOK_STATUS.OPEN,
                    price: { lte: newBuyOrder.price },
                    user_id: { not: user.id }
                },
                orderBy: { price: "asc" }
            });

            if (!bestSellOrder) {
                // No match → order stays OPEN with locked funds
                return h.response({ success: true, data: newBuyOrder }).code(201);
            }

            // 5️ Determine matched quantity
            const matchedQty = Math.min(newBuyOrder.quantity, bestSellOrder.quantity);

            // 6️ Run transaction for match
            const result = await prisma.$transaction(async (tx) => {
                // --- Buyer centralize balance update (deduct locked quote, add base) ---
                const buyerCentral = await tx.centralizeBalance.findFirst({
                    where: { user_id: newBuyOrder.user_id }
                });

                await tx.centralizeBalance.update({
                    where: { id: buyerCentral.id, user_id: newBuyOrder.user_id },
                    data: {
                        balance: {
                            ...buyerCentral.balance,
                            [quote]: Number(buyerCentral.balance[quote]) - (matchedQty * bestSellOrder.price),
                            [base]: Number(buyerCentral.balance[base] || 0) + matchedQty
                        }
                    }
                });

                // --- Seller centralize balance update (deduct base, add quote) ---
                const sellerCentral = await tx.centralizeBalance.findFirst({
                    where: { user_id: bestSellOrder.user_id }
                });

                await tx.centralizeBalance.update({
                    where: { id: sellerCentral.id, user_id: bestSellOrder.user_id },
                    data: {
                        balance: {
                            ...sellerCentral.balance,
                            [base]: Number(sellerCentral.balance[base]) - matchedQty,
                            [quote]: Number(sellerCentral.balance[quote] || 0) + (matchedQty * bestSellOrder.price)
                        }
                    }
                });

                // --- Update BUY orderbook ---
                const updatedBuyOrder = await tx.orderBook.update({
                    where: { id: newBuyOrder.id },
                    data: {
                        quantity: (newBuyOrder.quantity - matchedQty).toString(),
                        status: newBuyOrder.quantity - matchedQty === 0
                            ? ORDER_BOOK_STATUS.COMPLETED
                            : ORDER_BOOK_STATUS.OPEN
                    }
                });

                // --- Update SELL orderbook ---
                await tx.orderBook.update({
                    where: { id: bestSellOrder.id },
                    data: {
                        quantity: (bestSellOrder.quantity - matchedQty).toString(),
                        status: bestSellOrder.quantity - matchedQty === 0
                            ? ORDER_BOOK_STATUS.COMPLETED
                            : ORDER_BOOK_STATUS.OPEN
                    }
                });

                // --- Create Transaction record for buyer ---
                await tx.transaction.create({
                    data: {
                        user_id: newBuyOrder.user_id,
                        orderBook_id: newBuyOrder.id,
                        asset_pair: (newBuyOrder.asset_pair_id).toString(),
                        amount: String(matchedQty * bestSellOrder.price),
                        offerPrice: String(newBuyOrder.price),
                        tradePrice: String(bestSellOrder.price),
                        quantity: String(matchedQty),
                        orderType: ORDER_CATAGORY.BUY
                    }
                });

                // --- Create Transaction record for seller ---
                await tx.transaction.create({
                    data: {
                        user_id: bestSellOrder.user_id,
                        orderBook_id: bestSellOrder.id,
                        asset_pair: (newBuyOrder.asset_pair_id).toString(),
                        amount: String(matchedQty * bestSellOrder.price),
                        offerPrice: String(newBuyOrder.price),
                        tradePrice: String(bestSellOrder.price),
                        quantity: String(matchedQty),
                        orderType: ORDER_CATAGORY.SELL
                    }
                });

                return updatedBuyOrder;
            });

            return h.response({ success: true, data: result }).code(201);
        }


    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while order creation", error });
    }
}

const getOrderBookData = async (req, h) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 100;
        const skip = (page - 1) * limit;
        const total = await prisma.orderBook.count();

        const orders = await prisma.orderBook.findMany({
            where: { status: { not: ORDER_BOOK_STATUS.COMPLETED } },
            include: {
                asset_pair: {
                    select: {
                        id: true,
                        asset_pair: true,
                    }
                }
            },
            skip: skip,
            take: limit,
            orderBy: { id: "asc" }
        });
        return h.response({
            success: true, page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: orders
        }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Server error while fetching orders", error });
    }
}


module.exports = {
    creatOrder,
    getOrderBookData,

}