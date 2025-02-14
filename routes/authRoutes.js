const express = require("express");
const passport = require("passport");
const {authenticateJWT, verifyGoogleToken } = require("../Middleware/middleware");
const redis = require("../database/redisClient");


const router = express.Router();

// Google OAuth login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"]}));

// Google OAuth callback route
router.post("/google/callback", passport.authenticate("google", { failureRedirect: "http://localhost:3000" }), (req, res) => {
	try {

		if (!req.user || !req.user.token) {
		  throw new Error("Authentication failed");
		}
		const { user, token } = req.user;
		res.redirect(`http://localhost:3000/url-shortener?token=${token}`);

	} catch (error) {
		console.log(error);
		
		res.redirect("http://localhost:3000?error=OAuthFailed");
	}
});

router.post("/verify", verifyGoogleToken);

router.get("/logout", async function(req, res){

	const token = req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		return res.status(400).json({ success: false, message: "No token provided" });
	}

	// Store the token in Redis with an expiry time
	await redis.set(token, "blacklisted", "EX", 604800); // 7 days (same as JWT expiry)

	res.json({ success: true, message: "Logged out successfully" });

});

module.exports = router;
