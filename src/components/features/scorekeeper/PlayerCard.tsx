import { Card, CardContent } from "@/components/ui/card";

interface PlayerCardProps {
  player: {
    jerseyNumber: number;
    playerName: string;
  } | null;
  bgColor: string;
}

export default function PlayerCard({ player, bgColor }: PlayerCardProps) {
  if (!player) return null;

  return (
    <Card
      className="overflow-hidden border-2 shadow-lg"
      style={{ borderColor: bgColor }}
    >
      <CardContent className="p-6" style={{ backgroundColor: bgColor }}>
        <div className="text-center text-white">
          <div className="text-7xl font-bold mb-2">{player.jerseyNumber}</div>
          <div className="text-xl font-semibold tracking-wide">
            {player.playerName}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
