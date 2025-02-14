const redis = require("../database/redisClient");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const { connectDB, getDB } = require("../database/db");
const dotenv = require("dotenv");
dotenv.config();


const authenticateJWT = async function (req, res, next){

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the token is blacklisted
    const isBlacklisted = await redis.get(token);
    if (isBlacklisted) {
        return res.status(403).json({ message: "Token has been revoked" });
    }

    jwt.verify(token, process.env.AUTHJWT, function(err, user){
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });

}

async function verifyGoogleToken(req, res) {

    try {

        const { token } = req?.body;

        // Verify the Google token
        const response = await axios.get(`${process?.env?.GOOGLE_TOKEN_INFO_URL}?id_token=${token}`);

        if (!response.data.email) {
            return res.status(400).json({ success: false, message: "Invalid Google token" });
        }

        const { email, sub, name, picture } = response?.data;

        await connectDB(); // Ensure database connection
        const db = getDB();
        const usersCollection = db.collection("users");

        let user = await usersCollection.findOne({ googleId:sub });

        if (!user) {

            user = { 
                googleId: sub,
                displayName : name, 
                email :email, 
                avatar: picture,
                createdAt: new Date(),
            };

            await usersCollection.insertOne(user);
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { user },
            process?.env?.AUTHJWT,
            { expiresIn: "1h" }
        );

        res.json({ success: true, user, token: jwtToken });

    } catch (error) {

        console.error("Google Auth Error:", error.message);
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
}

module.exports = {authenticateJWT, verifyGoogleToken};
