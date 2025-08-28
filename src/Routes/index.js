const orderBookRoute = require('./orderBookRoute');
const user = require('./UserRoute')
const assetPair = require('./assetPairRoute')

module.exports = {
    name: 'base-route',
    version: '1.0.0',
    register: (server, options) => {
        server.route(user);
        server.route(orderBookRoute);
        server.route(assetPair)
    }
}   
