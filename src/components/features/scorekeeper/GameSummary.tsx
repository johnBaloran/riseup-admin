import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Player {
  _id: string;
  playerName: string;
  jerseyNumber: number;
  teamId?: string;
  team?: string;
  allStats?: Array<{
    game: string;
    points: number;
    rebounds: number;
    assists: number;
    blocks: number;
    steals: number;
    pointsString?: string;
  }>;
}

interface GameSummaryProps {
  gameWinner: string;
  players: Player[];
  checkedPlayers: Player[];
  homeTeamId: string;
  awayTeamId: string;
  homeTeamNameShort: string;
  awayTeamNameShort: string;
  gameId: string;
  playerOfTheGame: Player | null;
  selectedPlayerOfTheGame: string;
  onPlayerOfTheGameChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBackToScoring: () => void;
  isTeamsSwitched: boolean;
}

export default function GameSummary({
  gameWinner,
  players,
  checkedPlayers,
  homeTeamId,
  awayTeamId,
  homeTeamNameShort,
  awayTeamNameShort,
  gameId,
  playerOfTheGame,
  selectedPlayerOfTheGame,
  onPlayerOfTheGameChange,
  onBackToScoring,
  isTeamsSwitched,
}: GameSummaryProps) {
  const [chooseTeam, setChooseTeam] = React.useState(false);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Game Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {gameWinner !== "" && (
            <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200">
              <p className="text-sm text-slate-600 mb-1">WINNER</p>
              <p className="text-3xl font-bold text-slate-900">{gameWinner}</p>
            </div>
          )}

          {/* Team Toggle */}
          <div className="flex items-center justify-center">
            <div
              className={`inline-flex rounded-lg border bg-slate-100 p-1 ${
                isTeamsSwitched ? "flex-row-reverse" : ""
              }`}
            >
              <Button
                onClick={() => setChooseTeam(false)}
                variant={chooseTeam === false ? "default" : "ghost"}
                className="uppercase"
              >
                {homeTeamNameShort}
              </Button>
              <Button
                onClick={() => setChooseTeam(true)}
                variant={chooseTeam === true ? "default" : "ghost"}
                className="uppercase"
              >
                {awayTeamNameShort}
              </Button>
            </div>
          </div>

          {/* Stats Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead className="font-bold">PLAYER</TableHead>
                  <TableHead className="text-center font-bold">PTS</TableHead>
                  <TableHead className="text-center font-bold">REB</TableHead>
                  <TableHead className="text-center font-bold">AST</TableHead>
                  <TableHead className="text-center font-bold">BLK</TableHead>
                  <TableHead className="text-center font-bold">STL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkedPlayers
                  .filter((player) =>
                    chooseTeam
                      ? player.teamId === awayTeamId ||
                        player.team === awayTeamId
                      : player.teamId === homeTeamId ||
                        player.team === homeTeamId
                  )
                  .map((player, index) => {
                    const stat = player.allStats?.find(
                      (s: any) =>
                        s.game === gameId && s.pointsString !== undefined
                    );
                    return (
                      <TableRow
                        key={index}
                        className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}
                      >
                        <TableCell className="font-medium">
                          {player.playerName}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat?.points || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat?.rebounds || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat?.assists || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat?.blocks || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat?.steals || 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Player of the Game */}
          <Card className="bg-slate-50">
            <CardContent className="p-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase text-slate-600">
                  Player of the Game
                </p>
                {playerOfTheGame?.playerName ? (
                  <p className="text-2xl font-bold text-slate-900">
                    {playerOfTheGame?.playerName}
                  </p>
                ) : (
                  <p className="text-slate-500">No player selected</p>
                )}
                <select
                  value={selectedPlayerOfTheGame}
                  onChange={onPlayerOfTheGameChange}
                  className="w-full p-3 border rounded-lg bg-white text-slate-900"
                >
                  <option value="">Select Player</option>
                  {players.map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.playerName}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={onBackToScoring}
            variant="outline"
            className="w-full h-12"
          >
            Back to Scoring
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
