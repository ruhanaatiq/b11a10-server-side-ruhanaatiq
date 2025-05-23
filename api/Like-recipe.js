import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await client.connect();
    const collection = client.db("recipeDB").collection("recipes");

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $inc: { likes: 1 } });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to like recipe" });
  } finally {
    await client.close();
  }
}
