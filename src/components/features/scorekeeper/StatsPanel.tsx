import { Card, CardContent } from "@/components/ui/card";
import PointsControls from "./PointsControls";
import StatControl from "./StatControl";

interface Statistics {
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
  fouls: number;
  pointsString: string;
}

interface StatsPanelProps {
  statistics: Statistics | undefined;
  onIncrementPoint: (points: number) => void;
  onDecrementPoint: () => void;
  onIncrementStat: (statKey: string) => void;
  onDecrementStat: (statKey: string) => void;
}

const STATS = [
  { name: "Rebounds", key: "rebounds" },
  { name: "Assists", key: "assists" },
  { name: "Blocks", key: "blocks" },
  { name: "Steals", key: "steals" },
  { name: "Fouls", key: "fouls" },
];

export default function StatsPanel({
  statistics,
  onIncrementPoint,
  onDecrementPoint,
  onIncrementStat,
  onDecrementStat,
}: StatsPanelProps) {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-4 space-y-4">
        {/* Points Section */}
        <PointsControls
          currentPoints={statistics?.points || 0}
          pointsString={statistics?.pointsString || ""}
          onIncrementPoint={onIncrementPoint}
          onDecrementPoint={onDecrementPoint}
        />

        {/* Other Stats */}
        {STATS.map((stat) => (
          <StatControl
            key={stat.key}
            statName={stat.name}
            statKey={stat.key}
            currentValue={statistics?.[stat.key as keyof Statistics] as number || 0}
            onIncrement={onIncrementStat}
            onDecrement={onDecrementStat}
          />
        ))}
      </CardContent>
    </Card>
  );
}
