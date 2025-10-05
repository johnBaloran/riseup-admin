// src/types/team.ts

/**
 * Team with populated references
 */
import { ITeam } from "@/models/Team";
import { IPlayer } from "@/models/Player";
import { IDivision } from "@/models/Division";

export interface PopulatedTeam
  extends Omit<ITeam, "division" | "teamCaptain" | "players" | "_id"> {
  _id: string;
  division: {
    _id: string;
    divisionName: string;
    location: { name: string };
    city: { cityName: string };
  };
  teamCaptain?: {
    _id: string;
    playerName: string;
  };
  players: Array<{
    _id: string;
    playerName: string;
    jerseyNumber?: number;
  }>;
}

export interface LeanTeam extends Omit<ITeam, "_id"> {
  _id: string;
}
