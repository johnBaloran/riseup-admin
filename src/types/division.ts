// src/types/division.ts
import { ILocation } from "@/models/Location";
import { ILevel } from "@/models/Level";
import { IDivision } from "@/models/Division";

export interface PopulatedDivision
  extends Omit<IDivision, "location" | "level" | "city" | "_id"> {
  _id: string;
  location: ILocation & { _id: string };
  level: ILevel & { _id: string };
  city?: string; // Just the ID for city
}
