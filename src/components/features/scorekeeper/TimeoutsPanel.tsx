import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimeoutsPanelProps {
  homeTeam: {
    teamNameShort: string;
  };
  awayTeam: {
    teamNameShort: string;
  };
  homeTimeouts: {
    firstHalf: number;
    secondHalf: number;
  };
  awayTimeouts: {
    firstHalf: number;
    secondHalf: number;
  };
  onHomeClick: (half: "firstHalf" | "secondHalf") => void;
  onAwayClick: (half: "firstHalf" | "secondHalf") => void;
  isTeamsSwitched: boolean;
}

export default function TimeoutsPanel({
  homeTeam,
  awayTeam,
  homeTimeouts,
  awayTimeouts,
  onHomeClick,
  onAwayClick,
  isTeamsSwitched,
}: TimeoutsPanelProps) {
  const isDisabled = (team: any, half: "firstHalf" | "secondHalf") =>
    team[half] === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Timeouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`grid grid-cols-2 gap-6 ${
            isTeamsSwitched ? "flex flex-row-reverse" : ""
          }`}
        >
          {/* Home Team Timeouts */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase text-slate-600">
              {homeTeam.teamNameShort}
            </h3>
            <div className="space-y-2">
              <Button
                onClick={() => onHomeClick("firstHalf")}
                disabled={isDisabled(homeTimeouts, "firstHalf")}
                className="w-full"
                variant={
                  isDisabled(homeTimeouts, "firstHalf") ? "outline" : "default"
                }
              >
                1st Half: {homeTimeouts.firstHalf}
              </Button>
              <Button
                onClick={() => onHomeClick("secondHalf")}
                disabled={isDisabled(homeTimeouts, "secondHalf")}
                className="w-full"
                variant={
                  isDisabled(homeTimeouts, "secondHalf") ? "outline" : "default"
                }
              >
                2nd Half: {homeTimeouts.secondHalf}
              </Button>
            </div>
          </div>

          {/* Away Team Timeouts */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase text-slate-600 text-right">
              {awayTeam.teamNameShort}
            </h3>
            <div className="space-y-2">
              <Button
                onClick={() => onAwayClick("firstHalf")}
                disabled={isDisabled(awayTimeouts, "firstHalf")}
                className="w-full"
                variant={
                  isDisabled(awayTimeouts, "firstHalf") ? "outline" : "default"
                }
              >
                1st Half: {awayTimeouts.firstHalf}
              </Button>
              <Button
                onClick={() => onAwayClick("secondHalf")}
                disabled={isDisabled(awayTimeouts, "secondHalf")}
                className="w-full"
                variant={
                  isDisabled(awayTimeouts, "secondHalf") ? "outline" : "default"
                }
              >
                2nd Half: {awayTimeouts.secondHalf}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
