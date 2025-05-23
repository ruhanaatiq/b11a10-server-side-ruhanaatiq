const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000; // Change port to 5000 or any free port

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Mongo client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Main function
async function run() {
  try {
   await client.connect();
    console.log("Connected to MongoDB!");

    const recipeCollection = client.db("recipeDB").collection("recipes");

    // Root route
    app.get("/", (req, res) => {
      res.send("New Recipes server incoming!");
    });

    // Get all recipes
    app.get("/recipes", async (req, res) => {
      try {
        const result = await recipeCollection.find().toArray();
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch recipes" });
      }
    });
    
    // Get top 6 recipes by likes
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

    // Get single recipe by ID
    app.get("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const recipe = await recipeCollection.findOne({ _id: new ObjectId(id) });
        res.json(recipe);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch recipe details" });
      }
    });

    // Like a recipe (increment likes)
    app.put("/recipes/:id/like", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await recipeCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 } }
        );
        res.json(result);
      } catch (err) {
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
        const result = await recipeCollection.insertOne(recipe);
        res.status(201).json(result);
      } catch (err) {
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
        const userRecipes = await recipeCollection
          .find({ userEmail })
          .toArray();
        res.json(userRecipes);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch user's recipes" });
      }
    });

    // Update a recipe
    app.put("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;

      try {
        const result = await recipeCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updated }
        );
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to update recipe" });
      }
    });

    // Delete a recipe
    app.delete("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await recipeCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to delete recipe" });
      }
    });

    // Ping Mongo
   // await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connection verified.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

// Start server

app.listen(port, () => {
  console.log(`Recipe app running on port ${port}`);
});

