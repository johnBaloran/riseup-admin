import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface Player {
  _id: string;
  jerseyNumber: number;
  playerName: string;
  teamId?: string;
  team?: string;
}

interface PlayerListProps {
  players: Player[];
  teamId: string;
  teamNameShort: string;
  chosenPlayerId: string;
  onPlayerChange: (playerId: string, color: string) => void;
  color: string;
}

export default function PlayerList({
  players,
  teamId,
  teamNameShort,
  chosenPlayerId,
  onPlayerChange,
  color,
}: PlayerListProps) {
  const bgColorClass =
    color === "#1E40AF"
      ? "bg-blue-800 border-blue-600 text-white shadow-lg scale-105"
      : "bg-orange-600 border-orange-500 text-white shadow-lg scale-105";

  const defaultBgClass =
    color === "#1E40AF"
      ? "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
      : "bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100";

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          {teamNameShort}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {players
          .filter(
            (player) => player.teamId === teamId || player.team === teamId
          )
          .sort((a, b) => a.jerseyNumber - b.jerseyNumber)
          .map((player, index) => (
            <button
              key={index}
              onClick={() => onPlayerChange(player._id, color)}
              className={`w-full p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                player._id === chosenPlayerId ? bgColorClass : defaultBgClass
              }`}
            >
              <div className="text-3xl font-bold">{player.jerseyNumber}</div>
              <div className="text-xs mt-1 truncate">{player.playerName}</div>
            </button>
          ))}
      </CardContent>
    </Card>
  );
}
