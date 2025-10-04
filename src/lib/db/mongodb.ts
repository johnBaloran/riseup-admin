// src/lib/db/mongodb.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * This file has ONE job: manage MongoDB connection
 * No queries, no business logic, just connection management
 */

/**
 * Performance Optimization
 * - Global connection caching prevents multiple connections
 * - Connection pooling for better performance
 */

/**
 * Error Handling & Resilience
 * - Graceful error messages
 * - Connection retry logic built into Mongoose
 */

// src/lib/db/mongodb.ts
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

const MONGODB_URI: string = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");

      // Register all models after connection
      require("@/models/Admin");
      require("@/models/City");
      require("@/models/Location");
      require("@/models/Level");
      require("@/models/Division");
      require("@/models/Team");
      require("@/models/Player");
      require("@/models/User");
      require("@/models/Game");
      require("@/models/Price");
      require("@/models/PaymentMethod");
      require("@/models/JerseyOrder");
      require("@/models/GamePhoto");
      require("@/models/ChatChannel");
      require("@/models/ChatMessage");
      require("@/models/MessageForward");

      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }

  return cached.conn;
}

export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("MongoDB disconnected");
  }
}

export function isConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}
