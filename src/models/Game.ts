// src/models/Game.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game model - game data structure ONLY
 *
 * BACKWARD COMPATIBLE:
 * - All new fields are optional
 * - Existing games will continue to work
 * - New scheduling features enhance without breaking
 */

import mongoose from "mongoose";

const Schema = mongoose.Schema;

export type GameWeekType = "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";

export interface IGame extends mongoose.Document {
  // ===== EXISTING FIELDS (unchanged) =====
  gameName: string;
  date: Date;
  time: string;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  homeTeamScore: number;
  awayTeamScore: number;
  status: boolean; // completed or not
  started: boolean;
  division: mongoose.Types.ObjectId;
  players: mongoose.Types.ObjectId[];
  playerOfTheGame?: mongoose.Types.ObjectId;
  youtubeLink?: string;
  isPlayoffGame: boolean;
  gamePhotosCount: number;

  // ===== NEW SCHEDULING FIELDS (all optional for backward compatibility) =====
  week?: number; // Week number (1-N based on division config)
  weekType?: GameWeekType; // Type of game week
  published?: boolean; // Visible to players or draft
  dateOverride?: boolean; // True if admin manually changed date
  calculatedDate?: Date; // Auto-calculated date for reference

  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    // ===== EXISTING FIELDS =====
    gameName: {
      type: String,
      required: [true, "Game name is required"],
    },
    date: {
      type: Date,
      required: [true, "Game date is required"],
    },
    time: {
      type: String,
      required: [true, "Game time is required"],
    },
    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Home team is required"],
    },
    awayTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Away team is required"],
    },
    homeTeamScore: {
      type: Number,
      default: 0,
    },
    awayTeamScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
    started: {
      type: Boolean,
      default: false,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    playerOfTheGame: {
      type: Schema.Types.ObjectId,
      ref: "Player",
    },
    youtubeLink: String,
    isPlayoffGame: {
      type: Boolean,
      default: false,
    },
    gamePhotosCount: {
      type: Number,
      default: 0,
    },

    // ===== NEW SCHEDULING FIELDS =====
    week: {
      type: Number,
      min: [1, "Week must be at least 1"],
      // Optional - can be calculated from date if missing
    },
    weekType: {
      type: String,
      enum: ["REGULAR", "QUARTERFINAL", "SEMIFINAL", "FINAL"],
      // Optional - can be inferred from isPlayoffGame flag
    },
    published: {
      type: Boolean,
      default: true, // Existing games are already live
    },
    dateOverride: {
      type: Boolean,
      default: false,
    },
    calculatedDate: {
      type: Date,
      // Optional - for reference only
    },
  },
  {
    timestamps: true,
  }
);

// ===== INDEXES =====
gameSchema.index({ division: 1, date: -1 });
gameSchema.index({ division: 1, week: 1 }); // NEW: for week-based queries
gameSchema.index({ division: 1, weekType: 1 }); // NEW: for playoff queries
gameSchema.index({ division: 1, published: 1 }); // NEW: for draft/published filtering
gameSchema.index({ date: -1 });
gameSchema.index({ status: 1 });
gameSchema.index({ gamePhotosCount: 1 });

// ===== VALIDATION =====
// Prevent same team as home and away
gameSchema.pre("save", function (next) {
  if (this.homeTeam.equals(this.awayTeam)) {
    return next(new Error("Home team and away team cannot be the same"));
  }
  next();
});

// Auto-set weekType based on week if not provided
gameSchema.pre("save", async function (next) {
  if (!this.weekType && this.week) {
    try {
      const Division = mongoose.model("Division");
      const division = await Division.findById(this.division);

      if (division && division.seasonConfig) {
        const regularWeeks = division.seasonConfig.regularSeasonWeeks || 7;

        if (this.week <= regularWeeks) {
          this.weekType = "REGULAR";
        } else if (this.week === regularWeeks + 1) {
          this.weekType = "QUARTERFINAL";
        } else if (this.week === regularWeeks + 2) {
          this.weekType = "SEMIFINAL";
        } else if (this.week === regularWeeks + 3) {
          this.weekType = "FINAL";
        }
      }
    } catch (error) {
      console.warn("Could not auto-set weekType:", error);
    }
  }
  next();
});

export default (mongoose.models.Game as mongoose.Model<IGame>) ||
  mongoose.model<IGame>("Game", gameSchema);
