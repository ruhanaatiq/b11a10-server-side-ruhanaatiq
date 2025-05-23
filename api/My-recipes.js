import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  try {
    await client.connect();
    const collection = client.db("recipeDB").collection("recipes");
    const recipes = await collection.find({ userEmail: email }).toArray();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's recipes" });
  } finally {
    await client.close();
  }
}
