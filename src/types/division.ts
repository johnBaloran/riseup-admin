// src/types/division.ts
import { ILocation } from "@/models/Location";
import { ILevel } from "@/models/Level";
import { IDivision } from "@/models/Division";

export interface PopulatedDivision {
  _id: string;
  divisionName: string;
  description: string;
  city: string | { _id: string; cityName: string; region: string };
  location: { _id: string; name: string };
  level: { _id: string; name: string; grade: number };
  day: string;
  startDate?: Date;
  startTime?: string;
  endTime?: string;
  earlyBirdDeadline?: Date;
  active: boolean;
  register: boolean;
  prices: {
    earlyBird?: { _id: string; amount: number; name: string };
    regular?: { _id: string; amount: number; name: string };
    installment?: { _id: string; amount: number; name: string };
    regularInstallment?: { _id: string; amount: number; name: string };
    firstInstallment?: { _id: string; amount: number; name: string };
    free?: { _id: string; amount: number; name: string };
  };
}
