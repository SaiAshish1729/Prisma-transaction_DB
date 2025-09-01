const { SUPPORTED_ASSETS } = require("./index");
const prisma = require("../config/DbConfig");

const getInitialBalances = () => {
    const balances = {};
    SUPPORTED_ASSETS.forEach(asset => {
        balances[asset] = "500";
    });
    return balances;
}

module.exports = {
    getInitialBalances
}