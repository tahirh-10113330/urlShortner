const rateLimit = require("express-rate-limit");

const limiter = rateLimit({

    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each user to 10 requests per hour
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false

});

module.exports = limiter;
