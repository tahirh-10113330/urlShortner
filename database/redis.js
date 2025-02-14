const Redis = require("ioredis");
const dotenv = require("dotenv");
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  family: 4, // Use IPv4
  connectTimeout: 10000, // 10 seconds timeout
  retryStrategy: (times) => Math.min(times * 50, 2000), // Retry logic
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

module.exports = redis;
