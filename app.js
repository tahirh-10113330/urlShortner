const express = require("express");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const urlRoutes = require('./routes/urlRoutes');

dotenv.config();
require("./auth"); // Ensure passport config is loaded
const { connectDB } = require("./database/db");

const app = express();

// **Fix: Add Express Session**
app.use(
	session({
		secret: process.env.AUTHJWT, // Change this to a strong random string
		resave: false,
		saveUninitialized: false,
	})
);

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));

app.use(
	cors({
	  origin: "http://localhost:3000", // Allow frontend to access backend
	  credentials: true, // Allow cookies & authentication headers
	  methods: "GET,POST,PUT,DELETE",
	  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
	})
  );

// app.use((req, res, next) => {
// 	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
// 	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
// 	next();
// });

// Connect to MongoDB
connectDB().then(function(){

	console.log("🚀 Database connected. Starting server...");

	// Define routes
	app.use("/api", urlRoutes);
	app.use("/api/auth", authRoutes);

	const PORT = process.env.PORT || 3000;
	app.listen(PORT, function() {
		console.log(`Server running on port ${PORT}`);
	});

});
