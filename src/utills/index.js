const ORDER_CATAGORY = {
    BUY: "buy",
    SELL: "sell"
}

const ORDER_BOOK_STATUS = {
    COMPLETED: "completed",
    PENDING: "pending",
    OPEN: "open"
}

const ORDER_TYPE = {
    LIMIT: "limit",
    MARKET: "market"
}
const SUPPORTED_ASSETS = [
    // Fiat
    "USD", "EUR", "GBP", "JPY", "CNY", "INR", "AUD", "CAD", "CHF", "SGD",
    "HKD", "NZD", "SEK", "NOK", "DKK", "RUB", "BRL", "MXN", "ZAR", "TRY",

    // Major Cryptos
    "BTC", "ETH", "BNB", "USDT", "USDC", "XRP", "ADA", "DOGE", "SOL", "TRX",
    "DOT", "MATIC", "LTC", "SHIB", "BCH", "AVAX", "XLM", "LINK", "ATOM", "UNI",

    // More Cryptos
    "ETC", "XMR", "VET", "ICP", "FIL", "NEAR", "HBAR", "EGLD", "APT", "QNT",
    "AAVE", "SAND", "MANA", "AXS", "GRT", "ALGO", "FLOW", "XTZ", "THETA", "EOS",

    // Stablecoins + Wrapped
    "DAI", "TUSD", "PAXG", "FRAX", "USTC", "LUSD", "WBTC", "WETH", "USDP", "CUSD",

    // DeFi / Layer 2
    "CRV", "SNX", "DYDX", "GMX", "LRC", "ZRX", "1INCH", "BAL", "COMP", "YFI",
    "SUSHI", "BAT", "RUNE", "FTM", "KSM", "GALA", "IMX", "OP", "ARB", "MINA",

    // Extras / New-gen
    "CHZ", "ENJ", "KAVA", "HNT", "ZIL", "STX", "RVN", "CRO", "CELO", "DASH",
    "NANO", "ONT", "OMG", "WAVES", "BTG", "ICX", "ZEN", "XEM", "ANKR", "KLAY"
];

module.exports = {
    ORDER_CATAGORY,
    ORDER_BOOK_STATUS,
    ORDER_TYPE,
    SUPPORTED_ASSETS,
}