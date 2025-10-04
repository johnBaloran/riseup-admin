// src/types/city.ts
import { ICity } from "@/models/City";

export interface LeanCity extends Omit<ICity, "_id"> {
  _id: string;
}
