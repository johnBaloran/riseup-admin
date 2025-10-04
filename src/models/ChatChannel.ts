// src/models/ChatChannel.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * ChatChannel model - chat channel data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export type ChatChannelType =
  | "division"
  | "team"
  | "game"
  | "direct"
  | "support";

export interface IChatChannel extends mongoose.Document {
  channelName: string;
  channelType: ChatChannelType;
  referenceId?: mongoose.Types.ObjectId;
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    userName: string;
    joinedAt: Date;
  }>;
  isActive: boolean;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const chatChannelSchema = new Schema<IChatChannel>(
  {
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
      unique: true,
    },
    channelType: {
      type: String,
      enum: ["division", "team", "game", "direct", "support"],
      required: [true, "Channel type is required"],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        userName: {
          type: String,
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatChannelSchema.index({ channelName: 1 });
chatChannelSchema.index({ channelType: 1 });
chatChannelSchema.index({ "participants.userId": 1 });
chatChannelSchema.index({ isActive: 1, lastMessageAt: -1 });

export default (mongoose.models.ChatChannel as mongoose.Model<IChatChannel>) ||
  mongoose.model<IChatChannel>("ChatChannel", chatChannelSchema);
