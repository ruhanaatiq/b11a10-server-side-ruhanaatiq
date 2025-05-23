import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  const collection = client.db("recipeDB").collection("recipes");

  try {
    await client.connect();

    if (req.method === "GET") {
      const result = await collection.find().toArray();
      res.status(200).json(result);
    } else if (req.method === "POST") {
      const recipe = req.body;
      if (!recipe.userEmail) {
        return res.status(400).json({ error: "userEmail is required" });
      }
      const result = await collection.insertOne(recipe);
      res.status(201).json(result);
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  } finally {
    await client.close();
  }
}
