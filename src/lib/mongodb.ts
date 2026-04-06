import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 5,
    });
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db("main");
  return cachedDb;
}
