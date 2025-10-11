// src/types/jersey.ts

/**
 * SOLID - Interface Segregation Principle (ISP)
 * Define focused jersey-related types only
 */

import { ITeam } from "@/models/Team";
import { IPlayer } from "@/models/Player";
import { IDivision } from "@/models/Division";

export interface JerseyEdition {
  id: string;
  name: string;
  description: string;
}

export interface TeamJerseyDetails
  extends Omit<ITeam, "division" | "players" | "_id"> {
  _id: string;
  division: {
    _id: string;
    divisionName: string;
    day: string;
    jerseyDeadline?: Date;
    location: { name: string };
    level: { name: string };
  };
  players: Array<{
    _id: string;
    playerName: string;
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
    user?: string;
    paymentStatus?: {
      hasPaid?: boolean;
    };
  }>;
}

export interface DivisionWithTeams {
  _id: string;
  divisionName: string;
  location: {
    _id: string;
    name: string;
  };
  day: string;
  level: {
    name: string;
  };
  jerseyDeadline?: Date;
  teamCount: number;
  teams?: TeamWithJerseyInfo[];
}

export interface TeamWithJerseyInfo {
  _id: string;
  teamName: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  isCustomJersey: boolean;
  jerseyEdition?: string;
  jerseyImages: Array<{
    id: string;
    url: string;
    publicId: string;
  }>;
  players: Array<{
    _id: string;
    jerseyNumber?: number;
    jerseySize?: string;
    paymentStatus?: {
      hasPaid?: boolean;
    };
    user?: string;
  }>;
  genericJerseys: Array<{
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }>;
}

export interface JerseyStats {
  totalTeams: number;
  teamsWithDesign: number;
  teamsWithoutDesign: number;
  completeTeams: number;
}

export interface GenericJersey {
  jerseyNumber?: number;
  jerseySize?: string;
  jerseyName?: string;
}
