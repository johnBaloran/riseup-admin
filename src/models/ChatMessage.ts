// src/models/ChatMessage.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * ChatMessage model - chat message data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IChatMessage extends mongoose.Document {
  channelId: mongoose.Types.ObjectId;
  channelName: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  content: string;
  message: string;
  messageType: "text" | "system" | "announcement";
  metadata: Record<string, any>;
  edited: boolean;
  editedAt?: Date;
  reactions: Array<{
    userId: string;
    userName: string;
    emoji: string;
    timestamp: Date;
  }>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "ChatChannel",
    },
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    messageType: {
      type: String,
      enum: ["text", "system", "announcement"],
      default: "text",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    reactions: [
      {
        userId: String,
        userName: String,
        emoji: String,
        timestamp: Date,
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatMessageSchema.index({ channelName: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

export default (mongoose.models.ChatMessage as mongoose.Model<IChatMessage>) ||
  mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
