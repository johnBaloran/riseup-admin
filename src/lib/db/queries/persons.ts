// src/lib/db/queries/persons.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Person data access functions ONLY
 */

import { connectDB } from "../mongodb";
import Person from "@/models/Person";

/**
 * Get all persons for a given playerId
 */
export async function getPersonsByPlayerId(playerId: string) {
  await connectDB();

  if (!playerId) {
    return [];
  }

  const persons = await Person.find({ playerId }).lean();

  return persons;
}
