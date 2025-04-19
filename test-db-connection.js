// filepath: test-db-connection.js
const { MongoClient } = require('mongodb');

const uri = "mongodb://easyshop-mongodb:27017/easyshop"; // Replace with your MONGODB_URI
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const db = client.db("easyshop");
    const stats = await db.stats();
    console.log("Database Stats:", stats);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  } finally {
    await client.close();
  }
}

testConnection();
