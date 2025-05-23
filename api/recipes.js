import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default async function handler(req, res) {
  const { method, query, body } = req;
  const collection = client.db("recipeDB").collection("recipes");

  try {
    await client.connect();

    if (method === "GET") {
      // GET all or by email
      if (req.url.includes("/top")) {
        const top = await collection.find().sort({ likes: -1 }).limit(6).toArray();
        return res.status(200).json(top);
      } else if (query.email) {
        const userRecipes = await collection.find({ userEmail: query.email }).toArray();
        return res.status(200).json(userRecipes);
      } else if (query.id) {
        const single = await collection.findOne({ _id: new ObjectId(query.id) });
        return res.status(200).json(single);
      } else {
        const all = await collection.find().toArray();
        return res.status(200).json(all);
      }
    }

    if (method === "POST") {
      if (!body.userEmail) {
        return res.status(400).json({ error: "userEmail is required" });
      }
      const result = await collection.insertOne(body);
      return res.status(201).json(result);
    }

    if (method === "PUT") {
      if (query.id && query.like === "true") {
        const result = await collection.updateOne(
          { _id: new ObjectId(query.id) },
          { $inc: { likes: 1 } }
        );
        return res.status(200).json(result);
      } else if (query.id) {
        const result = await collection.updateOne(
          { _id: new ObjectId(query.id) },
          { $set: body }
        );
        return res.status(200).json(result);
      }
    }

    if (method === "DELETE" && query.id) {
      const result = await collection.deleteOne({ _id: new ObjectId(query.id) });
      return res.status(200).json(result);
    }

    res.status(405).json({ error: "Method Not Allowed" });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
}
