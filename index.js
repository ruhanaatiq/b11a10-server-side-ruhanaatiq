const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mongo client
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Reusable function to get recipe collection with per-request connection
async function getRecipeCollection() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("recipeDB").collection("recipes");
}

// Root route
app.get("/", (req, res) => {
  res.send("New Recipes server incoming!");
});

// Get all recipes
app.get("/recipes", async (req, res) => {
  try {
    const recipeCollection = await getRecipeCollection();
    const result = await recipeCollection.find().toArray();
    res.json(result);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// Get top 6 recipes by likes
app.get("/recipes/top", async (req, res) => {
  try {
    const recipeCollection = await getRecipeCollection();
    const topRecipes = await recipeCollection.find()
      .sort({ likes: -1 })
      .limit(6)
      .toArray();
    res.json(topRecipes);
  } catch (err) {
    console.error("Error fetching top recipes:", err);
    res.status(500).json({ error: "Failed to fetch top recipes" });
  }
});

// Get single recipe by ID
app.get("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const recipeCollection = await getRecipeCollection();
    const recipe = await recipeCollection.findOne({ _id: new ObjectId(id) });
    res.json(recipe);
  } catch (err) {
    console.error("Error fetching recipe:", err);
    res.status(500).json({ error: "Failed to fetch recipe details" });
  }
});

// Like a recipe (increment likes)
app.put("/recipes/:id/like", async (req, res) => {
  const id = req.params.id;
  try {
    const recipeCollection = await getRecipeCollection();
    const result = await recipeCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );
    res.json(result);
  } catch (err) {
    console.error("Error liking recipe:", err);
    res.status(500).json({ error: "Failed to like the recipe" });
  }
});

// Add a new recipe
app.post("/recipes", async (req, res) => {
  const recipe = req.body;

  if (!recipe.userEmail) {
    return res.status(400).json({ error: "userEmail is required" });
  }

  try {
    const recipeCollection = await getRecipeCollection();
    const result = await recipeCollection.insertOne(recipe);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error adding recipe:", err);
    res.status(500).json({ error: "Failed to add recipe" });
  }
});

// Get recipes by user email
app.get("/my-recipes", async (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) {
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  try {
    const recipeCollection = await getRecipeCollection();
    const userRecipes = await recipeCollection.find({ userEmail }).toArray();
    res.json(userRecipes);
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ error: "Failed to fetch user's recipes" });
  }
});

// Update a recipe
app.put("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  const updated = req.body;

  try {
    const recipeCollection = await getRecipeCollection();
    const result = await recipeCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );
    res.json(result);
  } catch (err) {
    console.error("Error updating recipe:", err);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// Delete a recipe
app.delete("/recipes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const recipeCollection = await getRecipeCollection();
    const result = await recipeCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    console.error("Error deleting recipe:", err);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Recipe app running on port ${port}`);
});
