import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const collection = client.db("recipeDB").collection("recipes");

    const topRecipes = await collection.find().sort({ likes: -1 }).limit(6).toArray();
    res.status(200).json(topRecipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top recipes" });
  } finally {
    await client.close();
  }
}
