/**
 * Face Recognition Types - Index
 *
 * Exports all face recognition related types
 */

export * from "./person";
export * from "./gamePhoto";

/**
 * Face Recognition API Response Types
 */

export interface FaceStats {
  photos: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  faces: {
    total: number;
    linked: number;
    unlinked: number;
  };
  persons: {
    total: number;
    linkedToPlayers: number;
    unlinked: number;
  };
}

export interface ProcessPhotoRequest {
  photoId: string;
  photoUrl: string;
  gameId: string;
}

export interface ProcessPhotoResponse {
  photoId: string;
  facesDetected: number;
  matchedFaces: number;
  newPersons: number;
  processingTime: number;
}

export interface LinkPlayerRequest {
  personId: string;
  playerId: string;
}

export interface LinkPlayerResponse {
  success: boolean;
  personId: string;
  playerId: string;
  message: string;
}

export interface MergePersonsRequest {
  primaryPersonId: string;
  secondaryPersonId: string;
  playerId?: string; // Optional: Link to player during merge
}

export interface MergePersonsResponse {
  success: boolean;
  primaryPersonId: string;
  secondaryPersonId: string;
  photosUpdated: number;
  linkedToPlayer?: boolean;
  message: string;
}

export interface PersonDetailResponse {
  person: {
    _id: string;
    gameId: string;
    playerId?: string;
    faceId?: string;
    faceCropUrl: string;
    metadata: {
      qualityScore: number;
    };
    createdAt: string;
  };
  totalPhotos: number;
  photos: Array<{
    _id: string;
    cloudinaryUrl: string;
    game: string;
    detectedFaces: Array<{
      faceCropUrl: string;
      confidence: number;
      personId?: string;
    }>;
  }>;
}

/**
 * Response from GET /api/v1/faces/persons/game/:gameId
 * Replaces old GameAppearanceResponse
 */
export interface GamePersonsResponse {
  gameId: string;
  totalPersons: number;
  persons: Array<{
    _id: string;
    gameId: string;
    playerId?: string;
    faceId?: string;
    faceCropUrl: string;
    metadata: {
      qualityScore: number;
    };
    photoCount: number; // Calculated from GamePhotos
    createdAt: string;
    updatedAt: string;
  }>;
  totalPhotosWithFaces: number;
}

/**
 * Merge Suggestions Response
 */
export interface MergeSuggestionsResponse {
  gameId: string;
  suggestions: Array<{
    personId: string;
    faceCropUrl: string;
    photoCount: number;
    playerId?: string;
  }>;
}
