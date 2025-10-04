// src/types/level.ts
import { ILevel } from "@/models/Level";

export interface LeanLevel extends Omit<ILevel, "_id"> {
  _id: string;
}
