import { MongoClient, type Db } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "rioms"

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

declare global {
  // eslint-disable-next-line no-var
  var _riomsMongoClientPromise: Promise<MongoClient> | undefined
}

export function isDbConfigured(): boolean {
  return Boolean(uri)
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it in Project Settings to enable the database.",
    )
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._riomsMongoClientPromise) {
      client = new MongoClient(uri)
      global._riomsMongoClientPromise = client.connect()
    }
    return global._riomsMongoClientPromise
  }

  if (!clientPromise) {
    client = new MongoClient(uri)
    clientPromise = client.connect()
  }
  return clientPromise
}

export async function getDb(): Promise<Db> {
  const c = await getClientPromise()
  return c.db(dbName)
}
