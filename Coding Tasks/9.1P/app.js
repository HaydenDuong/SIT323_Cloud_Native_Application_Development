require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoOptions = {
  auth: {
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD
  },
  authSource: 'admin'
};

const client = new MongoClient(mongoUri, mongoOptions);
let db;

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(process.env.MONGO_DB_NAME || 'myappdb');
    return db;
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Cloud Native App with MongoDB!');
});

// CRUD Endpoints
// Create
app.post('/items', async (req, res) => {
  try {
    const collection = db.collection('items');
    const result = await collection.insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all
app.get('/items', async (req, res) => {
  try {
    const collection = db.collection('items');
    const items = await collection.find({}).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
app.get('/items/:id', async (req, res) => {
  try {
    const collection = db.collection('items');
    const item = await collection.findOne({ _id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put('/items/:id', async (req, res) => {
  try {
    const collection = db.collection('items');
    const result = await collection.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete('/items/:id', async (req, res) => {
  try {
    const collection = db.collection('items');
    const result = await collection.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
async function startServer() {
  await connectToMongo();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);

// Handle shutdown
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});