const jwt = require('jsonwebtoken');
const prisma = require('../config/DbConfig');
const SECRET = process.env.SECRET


const Authentication = async (req, h) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return h.response({ status: 400, message: "No token provided" }).code(400).takeover();
        }

        const verifytoken = jwt.verify(token, SECRET);

        const rootUser = await prisma.user.findFirst({ where: { email: verifytoken.email } });

        if (!rootUser) {
            return h.response({ message: "Unauthorized User!" }).code(401).takeover();
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser.id;

        return h.continue;
    } catch (error) {
        console.error('Authentication error:', error);
        return h.response({ message: "Unauthorized User!", error: error.message }).code(401).takeover();
    }
}

module.exports = {
    Authentication
}