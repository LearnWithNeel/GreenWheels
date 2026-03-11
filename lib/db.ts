import mongoose from "mongoose";

// ─── 1. Validate env var at startup ──────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "\n❌ MONGODB_URI missing!\n" +
    "   Open .env.local and paste your MongoDB Atlas connection string.\n"
  );
}

// ─── 2. Global cache — survives Next.js hot reload ───────────────────────────
// Without this, every file save creates a NEW connection.
// On Atlas free tier that causes "too many connections" error fast.
interface MongoCache {
  conn:    typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _gwMongo: MongoCache | undefined;
}

const cache: MongoCache = global._gwMongo ?? { conn: null, promise: null };
global._gwMongo = cache;

// ─── 3. Connection options ────────────────────────────────────────────────────
// family: 4 → forces IPv4
// This fixes ECONNREFUSED on Windows where IPv6 causes connection issues
const OPTS: mongoose.ConnectOptions = {
  bufferCommands:           false,
  maxPoolSize:              10,
  minPoolSize:              2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS:          45000,
  family:                   4,
};

// ─── 4. Main connect function ─────────────────────────────────────────────────
export async function connectDB(): Promise<typeof mongoose> {

  // Already connected — return immediately
  if (cache.conn && mongoose.connection.readyState === 1) {
    console.log("[GW-DB] ✅ Using existing connection");
    return cache.conn;
  }

  // Connection in progress — wait for it
  if (!cache.promise) {
    console.log("[GW-DB] 🔄 Connecting to MongoDB Atlas...");

    cache.promise = mongoose
      .connect(MONGODB_URI!, OPTS)
      .then((instance: typeof mongoose) => {
        console.log(`[GW-DB] ✅ Connected → ${mongoose.connection.host}`);
        return instance;
      })
      .catch((err: Error) => {
        // Clear promise so next request retries
        cache.promise = null;

        // ── Helpful error messages based on error type ──
        if (err.message.includes("ECONNREFUSED")) {
          console.error(
            "\n❌ MongoDB ECONNREFUSED\n" +
            "   Your IP is not whitelisted on Atlas.\n" +
            "   Fix: Go to Atlas → Network Access → Add IP → 0.0.0.0/0\n"
          );
        } else if (err.message.includes("authentication failed")) {
          console.error(
            "\n❌ MongoDB Authentication Failed\n" +
            "   Wrong username or password in your MONGODB_URI.\n" +
            "   Fix: Check .env.local → MONGODB_URI\n"
          );
        } else if (err.message.includes("ENOTFOUND")) {
          console.error(
            "\n❌ MongoDB DNS Error\n" +
            "   Cannot resolve Atlas hostname.\n" +
            "   Fix: Check your internet connection and cluster URL.\n"
          );
        } else {
          console.error(`\n❌ MongoDB Error: ${err.message}\n`);
        }

        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

// ─── 5. Connection event listeners ───────────────────────────────────────────
mongoose.connection.on("disconnected", () => {
  console.warn("[GW-DB] ⚠️  Disconnected from MongoDB");
  cache.conn    = null;
  cache.promise = null;
});

mongoose.connection.on("error", (err: Error) => {
  console.error(`[GW-DB] ❌ Error: ${err.message}`);
});

// ─── 6. Graceful shutdown ─────────────────────────────────────────────────────
// Closes DB connection cleanly when you press Ctrl+C
if (process.env.NODE_ENV !== "test") {
  process.once("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("[GW-DB] 🔌 Connection closed (SIGINT)");
    process.exit(0);
  });
  process.once("SIGTERM", async () => {
    await mongoose.connection.close();
    console.log("[GW-DB] 🔌 Connection closed (SIGTERM)");
    process.exit(0);
  });
}

export default connectDB;