const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getInitialBalances } = require("../utills/helper");
const SECRET = process.env.SECRET

const createUser = async (req, h) => {
    try {
        const { name, email, password, } = req.payload;

        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
            }
        });
        if (existingUser) {
            return h.response({ message: "This user already exists.Please login" }).code(403);
        }
        const hashedPassword = await bcrypt.hash(password, 6);
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });

            const balance = await tx.balance.create({
                data: {
                    user_id: newUser.id,
                    balances: getInitialBalances(),
                },
            });

            return { user: newUser, balance };
        });

        return h.response({ success: true, message: "User created successfully", data: result }).code(201);
    } catch (error) {
        console.error("CreateUser Error:", error.message, error.stack, error.code || "");
        return h.response({ message: "Something went wrong", error: error.message }).code(500);
    }
};


const userLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const user = await prisma.user.findFirst({
            where: {
                email: email,
            }
        });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return h.response({ message: "Invalid password" });
        }
        const token = jwt.sign({ email: user.email }, SECRET, {
            expiresIn: "5d"
        });

        return h.response({ message: "Login sucessfully", token: token, data: user, }).code(200);

    } catch (error) {
        console.error("loginUser Error:", JSON.stringify(error, null, 2));
        return h.response({ message: "Something went wrong", error: error }).code(500);
    }
}

const myProfile = async (req, h) => {
    try {
        const user = req.rootUser
        return h.response({ success: true, data: user }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Something went wrong", error: error }).code(500);
    }
}
module.exports = {
    createUser,
    userLogin,
    myProfile
}