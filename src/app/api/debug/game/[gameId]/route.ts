// src/app/api/debug/game/[gameId]/route.ts
// Access via: http://localhost:3000/api/debug/game/68eff7af46aa02d7f16ad90b

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Game from "@/models/Game";
import Team from "@/models/Team";
import Division from "@/models/Division";

export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    await connectDB();

    const gameId = params.gameId;

    // Get raw game data
    const gameRaw = await Game.findById(gameId).lean();

    if (!gameRaw) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Get populated game data
    const gamePopulated = await Game.findById(gameId)
      .populate("homeTeam")
      .populate("awayTeam")
      .populate("division")
      .lean();

    // Check if teams exist
    const homeTeam = await Team.findById(gameRaw.homeTeam);
    const awayTeam = await Team.findById(gameRaw.awayTeam);
    const division = await Division.findById(gameRaw.division);

    return NextResponse.json({
      gameId,
      raw: gameRaw,
      populated: gamePopulated,
      validation: {
        homeTeamExists: !!homeTeam,
        awayTeamExists: !!awayTeam,
        divisionExists: !!division,
        homeTeamData: homeTeam
          ? {
              id: homeTeam._id,
              name: homeTeam.teamName,
              code: homeTeam.teamCode,
            }
          : null,
        awayTeamData: awayTeam
          ? {
              id: awayTeam._id,
              name: awayTeam.teamName,
              code: awayTeam.teamCode,
            }
          : null,
        divisionData: division
          ? {
              id: division._id,
              name: division.divisionName,
            }
          : null,
      },
      issues: [
        ...(!homeTeam ? ["Home team reference is invalid (team deleted)"] : []),
        ...(!awayTeam ? ["Away team reference is invalid (team deleted)"] : []),
        ...(!division ? ["Division reference is invalid"] : []),
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
