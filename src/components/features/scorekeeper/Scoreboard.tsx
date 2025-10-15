import { Card, CardContent } from "@/components/ui/card";

interface ScoreboardProps {
  homeTeam: {
    teamNameShort: string;
  };
  awayTeam: {
    teamNameShort: string;
  };
  homeScore: number;
  awayScore: number;
  isTeamsSwitched: boolean;
}

export default function Scoreboard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  isTeamsSwitched,
}: ScoreboardProps) {
  return (
    <Card className="rounded-none border-x-0 border-t-0 shadow-lg">
      <CardContent className="p-0">
        <div
          className={`grid grid-cols-11 gap-4 py-8 px-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white ${
            isTeamsSwitched ? "flex flex-row-reverse" : ""
          }`}
        >
          <div className="flex justify-between items-center col-span-5">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-300 mb-1">
                HOME
              </span>
              <span className="text-2xl font-bold uppercase tracking-wide">
                {homeTeam.teamNameShort}
              </span>
            </div>
            <span className="text-6xl font-bold">{homeScore}</span>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <div className="h-16 w-px bg-slate-600" />
          </div>
          <div className="flex justify-between items-center col-span-5">
            <span className="text-6xl font-bold">{awayScore}</span>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-slate-300 mb-1">
                AWAY
              </span>
              <span className="text-2xl font-bold uppercase tracking-wide">
                {awayTeam.teamNameShort}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
