const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let recipeCollection;

// Efficiently reuse MongoDB connection
async function connectToMongo() {
  if (!recipeCollection) {
    await client.connect();
    recipeCollection = client.db("recipeDB").collection("recipes");
    console.log("Connected to MongoDB!");
  }
  return recipeCollection;
}

// Routes
app.get("/", (req, res) => {
  res.send("New Recipes server incoming!");
});

app.get("/recipes", async (req, res) => {
  try {
    const collection = await connectToMongo();
    const result = await collection.find().toArray();
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

app.get("/recipes/top", async (req, res) => {
  try {
    const collection = await connectToMongo();
    const topRecipes = await collection.find().sort({ likes: -1 }).limit(6).toArray();
    res.json(topRecipes);
  } catch {
    res.status(500).json({ error: "Failed to fetch top recipes" });
  }
});

app.get("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const collection = await connectToMongo();
    const recipe = await collection.findOne({ _id: new ObjectId(id) });
    res.json(recipe);
  } catch {
    res.status(500).json({ error: "Failed to fetch recipe details" });
  }
});

app.put("/recipes/:id/like", async (req, res) => {
  const id = req.params.id;
  try {
    const collection = await connectToMongo();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to like the recipe" });
  }
});

app.post("/recipes", async (req, res) => {
  const recipe = req.body;
  if (!recipe.userEmail) {
    return res.status(400).json({ error: "userEmail is required" });
  }

  try {
    const collection = await connectToMongo();
    const result = await collection.insertOne(recipe);
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: "Failed to add recipe" });
  }
});

app.get("/my-recipes", async (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) {
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  try {
    const collection = await connectToMongo();
    const userRecipes = await collection.find({ userEmail }).toArray();
    res.json(userRecipes);
  } catch {
    res.status(500).json({ error: "Failed to fetch user's recipes" });
  }
});

app.put("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  const updated = req.body;

  try {
    const collection = await connectToMongo();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

app.delete("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const collection = await connectToMongo();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Export Express app as a serverless function handler
const serverless = require("serverless-http");
module.exports = serverless(app);

