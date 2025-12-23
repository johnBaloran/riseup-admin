// src/components/features/league/players/PlayerGameStatsTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Displays player's game-by-game stats in a table ONLY
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { EditGameStatDialog } from "./EditGameStatDialog";
import { DeleteGameStatButton } from "./DeleteGameStatButton";

interface GameStat {
  game: {
    _id: string;
    gameName: string;
    date: Date;
  };
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  threesMade: number;
  twosMade: number;
  freeThrowsMade: number;
}

interface PlayerGameStatsTableProps {
  stats: GameStat[];
  playerId: string;
  canManage?: boolean;
}
export function PlayerGameStatsTable({
  stats,
  playerId,
  canManage = false,
}: PlayerGameStatsTableProps) {
  console.log("PlayerGameStatsTable stats:", stats);
  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game-by-Game Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No game stats available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game-by-Game Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Rebounds</TableHead>
              <TableHead className="text-right">Assists</TableHead>
              <TableHead className="text-right">Steals</TableHead>
              <TableHead className="text-right">Blocks</TableHead>
              <TableHead className="text-right">3PM</TableHead>
              <TableHead className="text-right">2PM</TableHead>
              <TableHead className="text-right">FTM</TableHead>
              {canManage && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.game?._id}>
                <TableCell>
                  <Link
                    href={`/games/${stat.game?._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {stat.game?.gameName}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {formatDate(stat.game?.date, "MMM d, yyyy")}
                  </p>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {stat.points}
                </TableCell>
                <TableCell className="text-right">{stat.rebounds}</TableCell>
                <TableCell className="text-right">{stat.assists}</TableCell>
                <TableCell className="text-right">{stat.steals}</TableCell>
                <TableCell className="text-right">{stat.blocks}</TableCell>
                <TableCell className="text-right">{stat.threesMade}</TableCell>
                <TableCell className="text-right">{stat.twosMade}</TableCell>
                <TableCell className="text-right">
                  {stat.freeThrowsMade}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditGameStatDialog
                        playerId={playerId}
                        gameId={stat.game?._id}
                        gameName={stat.game?.gameName}
                        stat={stat}
                      />
                      <DeleteGameStatButton
                        playerId={playerId}
                        gameId={stat.game?._id}
                        gameName={stat.game?.gameName}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
