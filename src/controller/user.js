const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
        const user = await prisma.user.create({
            data: {
                name, email, password: hashedPassword,
            }
        });

        return h.response({ success: true, message: "User created successfully", data: user });
    } catch (error) {
        console.error("CreateUser Error:", error.message, error.stack, error.code || "");
        return h.response({ message: "Something went wrong", error: error.message }).code(500);
    }
};

// const createUser = async (req, h) => {
//     const start = Date.now();
//     try {
//         const { name, email, password } = req.payload;

//         console.log("⏱ Step 1:", Date.now() - start, "ms - payload received");

//         const existingUser = await prisma.user.findFirst({ where: { email } });
//         console.log("⏱ Step 2:", Date.now() - start, "ms - after DB findFirst");

//         const hashedPassword = await bcrypt.hash(password, 6);
//         console.log("⏱ Step 3:", Date.now() - start, "ms - after bcrypt.hash");

//         const user = await prisma.user.create({
//             data: { name, email, password: hashedPassword }
//         });
//         console.log("⏱ Step 4:", Date.now() - start, "ms - after DB create");

//         return h.response({ success: true, message: "User created", data: user });
//     } catch (error) {
//         console.error(error);
//         return h.response({ message: "Something went wrong" }).code(500);
//     }
// };


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
            expiresIn: "1d"
        });

        return h.response({ message: "Login sucessfully", data: user, token: token }).code(200);

    } catch (error) {
        console.error("loginUser Error:", JSON.stringify(error, null, 2));
        return h.response({ message: "Something went wrong", error: error }).code(500);
    }
}

module.exports = {
    createUser,
    userLogin
}