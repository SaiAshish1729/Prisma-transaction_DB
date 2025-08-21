const jwt = require('jsonwebtoken');
const prisma = require('../config/DbConfig');
const SECRET = process.env.SECRET

// const Authentication = async (req, h) => {
//     try {
//         const token = req.headers.authorization;
//         console.log("token :", token)

//         if (!token || token == undefined) {
//             return h.response({ status: 400, message: "No token provided" });
//         } else {
//             const verifytoken = jwt.verify(token, SECRET);
//             console.log("Token verification : ", verifytoken)


//             const rootUser = await prisma.Admin.findFirst({ where: { email: verifytoken.email } });
//             console.log("Root_User", rootUser)


//             if (!rootUser) { throw new Error("rootUser not found") }

//             req.token = token
//             req.rootUser = rootUser
//             req.userId = rootUser.id

//             // next();
//             return req
//         }



//     } catch (error) {
//         console.error('Authentication error:', error);
//         return h.response({ message: "Unauthorized User!", error }).code(400);
//     }
// }

const Authentication = async (req, h) => {
    try {
        const token = req.headers.authorization;
        // console.log("token :", token)

        if (!token) {
            return h.response({ status: 400, message: "No token provided" }).code(400).takeover();
        }

        const verifytoken = jwt.verify(token, SECRET);
        // console.log("Token verification : ", verifytoken);

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