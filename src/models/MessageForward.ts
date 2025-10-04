// src/models/MessageForward.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * MessageForward model - message forwarding tracking data structure ONLY
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IMessageForward extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  channelName: string;
  messageContent: string;
  sentBy: string;
  channels: ("sms" | "email")[];
  results: {
    sms?: "sent" | "failed" | "skipped";
    email?: "sent" | "failed" | "skipped";
  };
  errorMessages?: {
    sms?: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageForwardSchema = new Schema<IMessageForward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
    },
    messageContent: {
      type: String,
      required: [true, "Message content is required"],
    },
    sentBy: {
      type: String,
      default: "Support Team",
    },
    channels: [
      {
        type: String,
        enum: ["sms", "email"],
        required: true,
      },
    ],
    results: {
      sms: {
        type: String,
        enum: ["sent", "failed", "skipped"],
      },
      email: {
        type: String,
        enum: ["sent", "failed", "skipped"],
      },
    },
    errorMessages: {
      sms: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for rate limiting
messageForwardSchema.index({ userId: 1, createdAt: -1 });
messageForwardSchema.index({ channelName: 1, createdAt: -1 });

export default (mongoose.models
  .MessageForward as mongoose.Model<IMessageForward>) ||
  mongoose.model<IMessageForward>("MessageForward", messageForwardSchema);
