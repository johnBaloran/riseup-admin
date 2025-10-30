/**
 * Person Type - Face Recognition (Game-Scoped Architecture)
 *
 * KEY CHANGES:
 * - Persons are now game-scoped (exist only within one game)
 * - faceId is optional/temporary (deleted after processing)
 * - faceCropUrl is permanent (Cloudinary URL for UI display)
 * - Manual player linking only via playerId
 *
 * Key Concept:
 * - Person = Game-scoped face identity (one game only)
 * - Player = Roster entry (referenced via playerId)
 * - Query persons by gameId or playerId
 */

export interface SuggestedDuplicate {
  personId: string;
  similarity: number;
  status: "pending" | "confirmed" | "rejected";
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface PersonMetadata {
  qualityScore: number; // Quality score from AWS (brightness + sharpness) / 2
  lastSeen?: Date; // Last time this person was detected
  totalPhotos?: number; // Total photos featuring this person
}

export interface Person {
  _id: string;
  gameId: string; // Game-scoped: Person belongs to one game only
  playerId?: string; // Manual link to Player (optional)
  faceId?: string; // AWS Rekognition ID (temporary, deleted after processing)
  faceCropUrl: string; // Cloudinary face crop URL (permanent)
  metadata: PersonMetadata;
  suggestedDuplicates?: SuggestedDuplicate[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Person with populated Player reference
 */
export interface PersonWithPlayer extends Person {
  playerId?: string;
  player?: {
    _id: string;
    playerName: string;
    jerseyNumber: number;
    team: string;
  };
}

/**
 * Person statistics (aggregated from GamePhotos)
 */
export interface PersonStats {
  totalPhotos: number;
  averageConfidence?: number;
  qualityScore: number;
  firstSeen: Date;
  lastSeen: Date;
}
