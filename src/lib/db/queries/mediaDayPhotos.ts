// src/lib/db/queries/mediaDayPhotos.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Media day photo data access functions ONLY
 */

import { connectDB } from "../mongodb";
import MediaDayPhoto from "@/models/MediaDayPhoto";
import Location from "@/models/Location";
import mongoose from "mongoose";

/**
 * Type for aggregated media day session
 */
interface MediaDaySessionAggregation {
  _id: {
    location: mongoose.Types.ObjectId;
    date: string; // Format: YYYY-MM-DD
  };
  photoCount: number;
  photos: {
    _id: mongoose.Types.ObjectId;
    url: string;
    thumbnail: string;
    publicId: string;
    uploadedAt: Date;
  }[];
}

/**
 * Type for populated media day session
 */
interface PopulatedMediaDaySession {
  _id: {
    location: {
      _id: mongoose.Types.ObjectId;
      name: string;
      address?: string;
      city?: {
        cityName: string;
      };
    };
    date: string; // Format: YYYY-MM-DD
  };
  photoCount: number;
  photos: {
    _id: mongoose.Types.ObjectId;
    url: string;
    thumbnail: string;
    publicId: string;
    uploadedAt: Date;
  }[];
}

/**
 * Get media day photo sessions grouped by location and date
 */
export async function getMediaDaySessions({
  locationId,
  startDate,
  endDate,
}: {
  locationId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  await connectDB();

  // Build aggregation pipeline
  const matchStage: any = {};

  if (locationId) {
    matchStage.location = locationId;
  }

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = startDate;
    if (endDate) matchStage.date.$lte = endDate;
  }

  // Aggregate photos by location and date (truncated to day in UTC)
  const sessions = await MediaDayPhoto.aggregate<MediaDaySessionAggregation>([
    { $match: matchStage },
    {
      $group: {
        _id: {
          location: "$location",
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "UTC" },
          },
        },
        photoCount: { $sum: 1 },
        photos: {
          $push: {
            _id: "$_id",
            url: "$url",
            thumbnail: "$thumbnail",
            publicId: "$publicId",
            uploadedAt: "$uploadedAt",
          },
        },
      },
    },
    { $sort: { "_id.date": -1 } },
  ]);

  // Populate location details
  const populatedSessions = await Location.populate<PopulatedMediaDaySession>(
    sessions,
    {
      path: "_id.location",
      select: "name address city",
      populate: {
        path: "city",
        select: "cityName",
      },
    }
  );

  return populatedSessions.map((session) => ({
    location: session._id.location,
    date: session._id.date,
    photoCount: session.photoCount,
    photos: session.photos,
  }));
}

/**
 * Get photos for a specific location and date
 */
export async function getMediaDayPhotos(locationId: string, date: Date) {
  await connectDB();

  // Get photos for the exact date (day granularity in UTC)
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return MediaDayPhoto.find({
    location: locationId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .sort({ uploadedAt: -1 })
    .lean();
}

/**
 * Create a new media day photo
 */
export async function createMediaDayPhoto(data: {
  publicId: string;
  url: string;
  thumbnail: string;
  location: string;
  date: Date;
  tags?: string[];
}) {
  await connectDB();

  // Check if photo already exists
  const existing = await MediaDayPhoto.findOne({ publicId: data.publicId });
  if (existing) {
    throw new Error("Photo already exists");
  }

  const photo = await MediaDayPhoto.create({
    ...data,
    uploadedAt: new Date(),
  });

  return photo.toObject();
}

/**
 * Delete a media day photo
 */
export async function deleteMediaDayPhoto(id: string) {
  await connectDB();

  const photo = await MediaDayPhoto.findById(id);

  if (!photo) {
    throw new Error("Photo not found");
  }

  await MediaDayPhoto.findByIdAndDelete(id);

  return { deleted: true };
}

/**
 * Get unique media day dates for a location
 */
export async function getMediaDayDates(locationId?: string) {
  await connectDB();

  const matchStage: any = {};
  if (locationId) {
    matchStage.location = locationId;
  }

  const dates = await MediaDayPhoto.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        location: { $first: "$location" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return dates;
}
