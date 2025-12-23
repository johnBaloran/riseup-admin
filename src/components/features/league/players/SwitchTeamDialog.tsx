// src/components/features/league/players/SwitchTeamDialog.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { formatTimeRange } from "@/lib/utils/time";

interface Team {
  _id: string;
  teamName: string;
  teamNameShort: string;
  teamCode: string;
  division: {
    _id: string;
    divisionName: string;
  };
}

interface Division {
  _id: string;
  divisionName: string;
  city: { cityName: string };
  location: { name: string };
  level?: { name: string };
  day?: string;
  startTime?: string;
  endTime?: string;
  active: boolean;
  register: boolean;
}

interface DivisionWithTeams {
  division: Division;
  teams: Team[];
}

interface SwitchTeamDialogProps {
  playerId: string;
  currentTeamId?: string;
  currentDivisionId: string;
  teamsByDivision: DivisionWithTeams[];
}

export function SwitchTeamDialog({
  playerId,
  currentTeamId,
  currentDivisionId,
  teamsByDivision,
}: SwitchTeamDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSwitchTeam = async (newTeamId: string | null, newDivisionId: string) => {
    try {
      setSwitching(true);
      const response = await fetch(`/api/v1/players`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playerId,
          team: newTeamId,
          division: newDivisionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to switch team");
      }

      toast.success(
        newTeamId ? "Team switched successfully" : "Player is now a free agent"
      );
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error switching team:", error);
      toast.error(error.message || "Failed to switch team");
    } finally {
      setSwitching(false);
    }
  };

  // Separate teams by active and registration divisions
  const activeTeams: Array<{ team: Team; division: Division }> = [];
  const registrationTeams: Array<{ team: Team; division: Division }> = [];

  teamsByDivision.forEach(({ division, teams }) => {
    teams.forEach((team) => {
      if (division.active) {
        activeTeams.push({ team, division });
      }
      if (division.register) {
        registrationTeams.push({ team, division });
      }
    });
  });

  // Filter teams based on search query
  const filterTeams = (teams: Array<{ team: Team; division: Division }>) => {
    if (!searchQuery.trim()) return teams;

    const query = searchQuery.toLowerCase();
    return teams.filter(({ team, division }) =>
      team.teamName.toLowerCase().includes(query) ||
      division.divisionName.toLowerCase().includes(query) ||
      division.city.cityName.toLowerCase().includes(query) ||
      division.location.name.toLowerCase().includes(query) ||
      division.level?.name.toLowerCase().includes(query)
    );
  };

  const filteredActiveTeams = filterTeams(activeTeams);
  const filteredRegistrationTeams = filterTeams(registrationTeams);

  const renderTeamCard = (item: { team: Team; division: Division }) => {
    const { team, division } = item;
    const isCurrentTeam = team._id === currentTeamId;
    const isDifferentDivision = division._id !== currentDivisionId;

    return (
      <div
        key={team._id}
        className={`border rounded-lg p-3 ${
          isCurrentTeam ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {team.teamName}
              </h4>
              {isCurrentTeam && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 flex-shrink-0">
                  Current
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{division.divisionName}</span>
                {isDifferentDivision && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-amber-600 flex-shrink-0">Different Division</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{division.city.cityName}</span>
                <span className="text-gray-400">•</span>
                <span>{division.location.name}</span>
                {division.level && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{division.level.name}</span>
                  </>
                )}
              </div>
              {(division.day || (division.startTime && division.endTime)) && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {division.day && <span>{division.day}s</span>}
                  {division.startTime && division.endTime && (
                    <>
                      {division.day && <span className="text-gray-400">•</span>}
                      <span>{formatTimeRange(division.startTime, division.endTime)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isCurrentTeam && (
            <Button
              size="sm"
              onClick={() => handleSwitchTeam(team._id, division._id)}
              disabled={switching}
              className="flex-shrink-0"
            >
              {switching ? "Switching..." : "Switch"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <ArrowRightLeft className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Switch Team</DialogTitle>
          <DialogDescription>
            Select a new team for this player from any active division.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Divisions ({activeTeams.length})
            </TabsTrigger>
            <TabsTrigger value="registration">
              Registration Open ({registrationTeams.length})
            </TabsTrigger>
          </TabsList>

          {/* Search Filter */}
          <div className="mt-4">
            <Input
              placeholder="Search teams or divisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <TabsContent value="active" className="space-y-2 mt-4">
            {filteredActiveTeams.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                {searchQuery ? "No teams found" : "No active teams available"}
              </div>
            ) : (
              filteredActiveTeams.map((item) => renderTeamCard(item))
            )}

            {activeTeams.some(
              ({ division }) => division._id !== currentDivisionId
            ) && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Note:</span> Switching to a team
                  in a different division will also move the player to that division.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="registration" className="space-y-2 mt-4">
            {filteredRegistrationTeams.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                {searchQuery ? "No teams found" : "No teams with registration open"}
              </div>
            ) : (
              filteredRegistrationTeams.map((item) => renderTeamCard(item))
            )}

            {registrationTeams.some(
              ({ division }) => division._id !== currentDivisionId
            ) && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Note:</span> Switching to a team
                  in a different division will also move the player to that division.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
