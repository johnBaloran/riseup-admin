/**
 * GamePhoto Type - Enhanced with Face Recognition
 *
 * Represents a photo uploaded to a game with face detection data
 */

export interface BoundingBox {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface DetectedFace {
  faceId: string;
  boundingBox: BoundingBox;
  confidence: number;
  personId?: string;
  playerId?: string;
  manuallyLinked: boolean;
}

export interface PrimaryPerson {
  personId: string;
  faceId: string;
  confidence: number;
}

export interface GamePhoto {
  _id: string;
  url: string;
  publicId: string;
  thumbnail: string;
  game: string;
  photographer?: string;
  tags: string[];
  isHighlight: boolean;
  uploadedAt: Date;

  // Face Recognition
  detectedFaces: DetectedFace[];
  primaryPerson?: PrimaryPerson;
  faceProcessingStatus: "pending" | "processing" | "completed" | "failed";
  faceProcessingError?: string;
  faceProcessedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * GamePhoto with populated references
 */
export interface GamePhotoWithRefs extends Omit<GamePhoto, "game" | "photographer"> {
  game: {
    _id: string;
    gameName: string;
    date: Date;
  };
  photographer?: {
    _id: string;
    name: string;
  };
}

/**
 * Photo processing stats
 */
export interface PhotoProcessingStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalFaces: number;
  linkedFaces: number;
  unlinkedFaces: number;
}
