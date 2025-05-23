import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  const { id } = req.query;
  const collection = client.db("recipeDB").collection("recipes");

  try {
    await client.connect();

    if (req.method === "GET") {
      const recipe = await collection.findOne({ _id: new ObjectId(id) });
      res.status(200).json(recipe);
    } else if (req.method === "PUT") {
      const updated = req.body;
      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updated });
      res.status(200).json(result);
    } else if (req.method === "DELETE") {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json(result);
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  } finally {
    await client.close();
  }
}
