const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });

let db = null;

async function connectDB() {
  if (db) return db; // Return if already connected
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("urlShortenerDB"); // Replace with your actual database name
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}

module.exports = { connectDB, getDB };
