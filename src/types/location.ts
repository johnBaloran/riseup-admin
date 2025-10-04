// src/types/location.ts
import { ILocation } from "@/models/Location";

export interface LeanLocation extends Omit<ILocation, "_id"> {
  _id: string;
}
