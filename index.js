const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.neq8pcg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Mongo client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const recipeCollection = client.db("recipeDB").collection("recipes");

    console.log("Connected to MongoDB!");

    // POST: Add a recipe
    app.post("/recipes", async (req, res) => {
      const recipe = req.body;
      const result = await recipeCollection.insertOne(recipe);
      res.send(result);
    });

    // GET: Top 6 recipes by likes
    app.get("/recipes/top", async (req, res) => {
      try {
        const topRecipes = await recipeCollection.find()
          .sort({ likes: -1 })
          .limit(6)
          .toArray();
        res.json(topRecipes);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch top recipes" });
      }
    });

    // GET: All recipes
    app.get("/recipes", async (req, res) => {
      const result = await recipeCollection.find().toArray();
      res.send(result);
    });

    // Mongo ping
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connection verified.");
  } finally {
    // You may want to keep the connection open (avoid client.close())
  }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
  res.send('New Recipes server incoming!');
});

app.listen(port, () => {
  console.log(`Recipe app running on port ${port}`);
});
