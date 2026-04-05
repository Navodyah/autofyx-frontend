import { MongoClient, ServerApiVersion, type Db } from 'mongodb';

declare global {
  var __autofyxMongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function normalizeEnvValue(value: string | undefined): string {
  if (!value) return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function getMongoUri(): string {
  return (
    normalizeEnvValue(process.env.MONGODB_URI) ||
    normalizeEnvValue(process.env.MONGODB) ||
    normalizeEnvValue(process.env.MONGO_URI) ||
    normalizeEnvValue(process.env.MONGODB_URL)
  );
}

function getMongoDbName(): string {
  return (
    normalizeEnvValue(process.env.MONGODB_DB) ||
    normalizeEnvValue(process.env.MONGO_DB) ||
    normalizeEnvValue(process.env.MONGODB_DB_NAME) ||
    'autofyx'
  );
}

export function isMongoConfigured(): boolean {
  return Boolean(getMongoUri());
}

function createClientPromise(): Promise<MongoClient> {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error(
      'Missing MongoDB connection string. Set MONGODB_URI (or MONGODB/MONGO_URI/MONGODB_URL) in frontend/autofyx/.env and restart Next.js.'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global.__autofyxMongoClientPromise) {
      const client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      global.__autofyxMongoClientPromise = client.connect();
    }

    return global.__autofyxMongoClientPromise;
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  return client.connect();
}

export async function getMongoDb(): Promise<Db> {
  if (!clientPromise) {
    clientPromise = createClientPromise();
  }

  const client = await clientPromise;
  return client.db(getMongoDbName());
}
