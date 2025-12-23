// scripts/inspect-game.ts
// Run with: npx tsx scripts/inspect-game.ts

import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";
import Game from "../src/models/Game.ts";
import Team from "../src/models/Team.ts";
import Division from "../src/models/Division.ts";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

const GAME_ID = "68eff7af46aa02d7f16ad90b";

async function inspectGame() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("🔌 Connecting to database...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to database\n");

    // Find game by ID - WITHOUT populate first
    console.log("🔍 Finding game (raw data)...");
    const gameRaw = await Game.findById(GAME_ID).lean();

    if (!gameRaw) {
      console.log("❌ Game not found!");
      return;
    }

    console.log("\n📋 RAW GAME DATA:");
    console.log(JSON.stringify(gameRaw, null, 2));

    // Now WITH populate
    console.log("\n\n🔍 Finding game (with populate)...");
    const gamePopulated = await Game.findById(GAME_ID)
      .populate("homeTeam")
      .populate("awayTeam")
      .populate("division")
      .lean();

    console.log("\n📋 POPULATED GAME DATA:");
    console.log(JSON.stringify(gamePopulated, null, 2));

    // Check team references
    console.log("\n\n🏀 TEAM REFERENCE CHECK:");
    console.log("homeTeam ObjectId:", gameRaw.homeTeam);
    console.log("awayTeam ObjectId:", gameRaw.awayTeam);

    // Try to find teams directly
    const homeTeam = await Team.findById(gameRaw.homeTeam);
    const awayTeam = await Team.findById(gameRaw.awayTeam);

    console.log("\n✅ Home Team exists:", !!homeTeam);
    if (homeTeam) {
      console.log("   Name:", homeTeam.teamName);
      console.log("   Code:", homeTeam.teamCode);
    }

    console.log("\n✅ Away Team exists:", !!awayTeam);
    if (awayTeam) {
      console.log("   Name:", awayTeam.teamName);
      console.log("   Code:", awayTeam.teamCode);
    }

    // Check division
    const division = await Division.findById(gameRaw.division);
    console.log("\n✅ Division exists:", !!division);
    if (division) {
      console.log("   Name:", division.divisionName);
    }

    // Summary
    console.log("\n\n📊 SUMMARY:");
    console.log("Game ID:", GAME_ID);
    console.log("Game Name:", gameRaw.gameName);
    console.log("Week:", gameRaw.week);
    console.log("Date:", gameRaw.date);
    console.log("Time:", gameRaw.time);
    console.log("Published:", gameRaw.published);
    console.log("Status:", gameRaw.status);
    console.log("\n⚠️  ISSUES:");
    if (!homeTeam) console.log("❌ Home team reference is invalid (team deleted)");
    if (!awayTeam) console.log("❌ Away team reference is invalid (team deleted)");
    if (!division) console.log("❌ Division reference is invalid");
    if (homeTeam && awayTeam && division) {
      console.log("✅ All references are valid!");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from database");
  }
}

inspectGame();
