const jwt = require('jsonwebtoken');
const prisma = require('../config/DbConfig');
const SECRET = process.env.SECRET

const Authentication = async (req, h) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return h.response({ status: 400, message: "No token provided" });
        } else {
            const verifytoken = jwt.verify(token, SECRET);
            console.log("Token verification : ", verifytoken)


            const rootUser = await prisma.Admin.findFirst({ where: { email: verifytoken.email } });
            console.log("Root_User", rootUser)


            if (!rootUser) { throw new Error("rootUser not found") }

            req.token = token
            req.rootUser = rootUser
            req.userId = rootUser.id

            // next();
            return req
        }



    } catch (error) {
        console.error('Authentication error:', error);
        return h.response({ message: "Unauthorized User!", error }).code(400);
    }
}

module.exports = {
    Authentication
}