// src/app/games/[divisionId]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division schedule management page ONLY
 *
 * Main interface for scheduling games within a division
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WeekSidebar } from "@/components/games/WeekSidebar";
import { WeekScheduleView } from "@/components/games/WeekScheduleView";
import { DeleteGameDialog } from "@/components/games/DeleteGameDialog";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

interface Division {
  id: string;
  name: string;
  location: { id: string; name: string };
  city: { id: string; name: string };
  day: string;
  timeRange: string;
  teamCount: number;
}

interface Team {
  id: string;
  name: string;
  shortName: string;
  currentDivisionId?: string;
  currentDivisionName?: string;
  isInDifferentDivision?: boolean;
}

interface Game {
  id: string;
  gameName: string;
  time: string;
  homeTeam: { id: string; name: string; code: string };
  awayTeam: { id: string; name: string; code: string };
  published: boolean;
  status: boolean;
  date: Date;
}

interface Week {
  weekNumber: number;
  weekType: "REGULAR" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  label: string;
  isRegular: boolean;
  isPlayoff: boolean;
  isComplete: boolean;
  isCurrent: boolean;
  games: Game[];
}

interface DivisionSchedule {
  division: Division;
  teams: Team[];
  weeks: Week[];
  currentWeek: number;
  totalWeeks: number;
}

interface TeamScheduleCount {
  teamId: string;
  teamCode: string;
  teamName: string;
  gameCount: number;
}

interface GameToSave {
  id?: string;
  gameName: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  published?: boolean;
  status?: boolean;
  date?: Date;
}

export default function DivisionSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const divisionId = params.divisionId as string;

  const [schedule, setSchedule] = useState<DivisionSchedule | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [teamCounts, setTeamCounts] = useState<TeamScheduleCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const scheduleViewRef = useRef<HTMLDivElement>(null);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    gameId: string;
    gameName: string;
    isPublished: boolean;
    isCompleted: boolean;
  }>({
    open: false,
    gameId: "",
    gameName: "",
    isPublished: false,
    isCompleted: false,
  });

  useEffect(() => {
    fetchDivisionSchedule();
  }, [divisionId]);

  useEffect(() => {
    if (schedule) {
      fetchTeamCounts(selectedWeek);
    }
  }, [selectedWeek, schedule]);

  // Fetch division schedule
  const fetchDivisionSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/games/divisions/${divisionId}`);
      if (!response.ok) throw new Error("Failed to fetch schedule");

      const data = await response.json();

      // Convert game date strings to Date objects
      const weeksWithDates = data.weeks.map((week: any) => ({
        ...week,
        games: week.games.map((game: any) => ({
          ...game,
          date: new Date(game.date),
        })),
      }));

      setSchedule({
        ...data,
        weeks: weeksWithDates,
      });

      // Set initial selected week to current week
      setSelectedWeek(data.currentWeek);
    } catch (error) {
      console.error("Error fetching division schedule:", error);
      toast.error("Failed to load division schedule");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team game counts for selected week
  const fetchTeamCounts = async (week: number) => {
    try {
      const response = await fetch(
        `/api/v1/games/week?divisionId=${divisionId}&week=${week}`
      );
      if (!response.ok) throw new Error("Failed to fetch team counts");

      const data = await response.json();
      setTeamCounts(data.teamCounts || []);
    } catch (error) {
      console.error("Error fetching team counts:", error);
    }
  };

  // Save games for a week
  const handleSaveGames = async (
    gamesToCreate: GameToSave[],
    gamesToUpdate: GameToSave[]
  ) => {
    try {
      setSaving(true);

      const selectedWeekData = schedule?.weeks.find(
        (w) => w.weekNumber === selectedWeek
      );

      if (!selectedWeekData) throw new Error("Week not found");

      const promises = [];

      // Handle games to create
      if (gamesToCreate.length > 0) {
        promises.push(handleCreateGames(gamesToCreate, selectedWeekData));
      }

      // Handle games to update
      if (gamesToUpdate.length > 0) {
        promises.push(handleUpdateGames(gamesToUpdate));
      }

      const results = await Promise.all(promises);

      let totalCreated = 0;
      let totalUpdated = 0;

      results.forEach((result) => {
        if (result) {
          if ("created" in result) {
            totalCreated += result.created;
          }
          if ("updated" in result) {
            totalUpdated += result.updated;
          }
        }
      });

      toast.success(
        `Successfully saved schedule: ${totalCreated} created, ${totalUpdated} updated.`
      );

      // Refresh schedule
      await fetchDivisionSchedule();
    } catch (error: any) {
      console.error("Error saving games:", error);
      toast.error(error.message || "Failed to save games");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGames = async (games: GameToSave[], weekData: Week) => {
    const gamesData = games.map((game) => {
      // Use game's date if set, otherwise use current date as default
      const gameDate = game.date ? new Date(game.date) : new Date();
      const [hours, minutes] = game.time.split(":").map(Number);
      const localDate = new Date(
        gameDate.getFullYear(),
        gameDate.getMonth(),
        gameDate.getDate(),
        hours,
        minutes
      );

      return {
        gameName: game.gameName,
        date: localDate.toISOString(),
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        published: true, // Always publish when saving
        week: selectedWeek,
        weekType: weekData.weekType,
      };
    });

    const response = await fetch("/api/v1/games/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        divisionId,
        week: selectedWeek,
        weekType: weekData.weekType,
        games: gamesData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create games");
    }

    return { created: games.length };
  };

  const handleUpdateGames = async (games: GameToSave[]) => {
    // Filter out completed games - they cannot be modified
    const gamesToUpdate = games.filter((game) => !game.status);

    const updatePromises = gamesToUpdate.map((game) => {
      if (!game.id) return Promise.resolve(null);

      // Combine date + time into a proper Date object
      const gameDate = game.date ? new Date(game.date) : new Date();
      const [hours, minutes] = game.time.split(":").map(Number);
      const combinedDate = new Date(
        gameDate.getFullYear(),
        gameDate.getMonth(),
        gameDate.getDate(),
        hours,
        minutes
      );

      return fetch(`/api/v1/games/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: combinedDate.toISOString(),
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          published: true, // Always publish when saving
        }),
      });
    });

    const responses = await Promise.all(updatePromises);

    // Collect failed updates
    const failures: string[] = [];
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (response && !response.ok) {
        const game = gamesToUpdate[i];
        failures.push(game.gameName || `Game ${i + 1}`);
      }
    }

    // If any updates failed, throw an error
    if (failures.length > 0) {
      throw new Error(
        `Failed to update ${failures.length} game(s): ${failures.join(", ")}`
      );
    }

    return { updated: gamesToUpdate.length };
  };

  // Delete game
  const handleDeleteGame = async () => {
    try {
      const response = await fetch(`/api/v1/games/${deleteDialog.gameId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete game");
      }

      toast.success("Game deleted successfully");

      // Refresh schedule
      await fetchDivisionSchedule();
      setDeleteDialog({ ...deleteDialog, open: false });
    } catch (error: any) {
      console.error("Error deleting game:", error);
      toast.error(error.message || "Failed to delete game");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Just refresh to reset any changes
    fetchDivisionSchedule();
  };

  // Handle mobile week selection with smooth scroll
  const handleMobileWeekSelect = () => {
    if (scheduleViewRef.current) {
      scheduleViewRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Handle delete game request from WeekScheduleView
  const handleDeleteGameRequest = (
    gameId: string,
    gameName: string,
    isPublished: boolean,
    isCompleted: boolean
  ) => {
    setDeleteDialog({
      open: true,
      gameId,
      gameName,
      isPublished,
      isCompleted,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">Division not found</p>
        <Link href="/games">
          <Button variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        </Link>
      </div>
    );
  }

  const currentWeekData = schedule.weeks.find(
    (w) => w.weekNumber === selectedWeek
  );

  // Get regular season weeks count
  const regularSeasonWeeks = schedule.weeks.filter((w) => w.isRegular).length;

  console.log("Division Schedule Page Render:", { schedule, selectedWeek });

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header */}
      <div className="border-b bg-white px-4 sm:px-6 py-4">
        <Link
          href="/games"
          className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 mb-3"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Back to Schedule Overview</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">
              <Link
                href={`/league/divisions/${divisionId}`}
                className="text-blue-600 hover:underline"
              >
                {schedule.division.name}
              </Link>
            </h1>
            <TutorialLink tutorialId="managing-games" />
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">
                {schedule.division.location?.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              {schedule.division.day}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {schedule.division.timeRange}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {schedule.division.teamCount} teams
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Week Sidebar */}
        <div className="md:w-64 border-b md:border-b-0 md:border-r">
          <WeekSidebar
            weeks={schedule.weeks}
            selectedWeek={selectedWeek}
            onWeekSelect={setSelectedWeek}
            regularSeasonWeeks={regularSeasonWeeks}
            onMobileWeekSelect={handleMobileWeekSelect}
          />
        </div>

        {/* Week Schedule View */}
        <div
          ref={scheduleViewRef}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {currentWeekData && (
            <WeekScheduleView
              weekNumber={currentWeekData.weekNumber}
              weekType={currentWeekData.weekType}
              weekLabel={currentWeekData.label}
              locationName={schedule.division.location?.name}
              games={currentWeekData.games.map((g) => ({
                id: g.id,
                gameName: g.gameName,
                homeTeam: g.homeTeam.id,
                awayTeam: g.awayTeam.id,
                published: g.published,
                status: g.status,
                date: g.date,
                time: g.time,
              }))}
              teams={schedule.teams}
              teamCounts={teamCounts}
              onSave={handleSaveGames}
              onCancel={handleCancel}
              onDeleteGame={handleDeleteGameRequest}
            />
          )}
        </div>
      </div>

      {/* Delete Game Dialog */}
      <DeleteGameDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteGame}
        gameName={deleteDialog.gameName}
        isPublished={deleteDialog.isPublished}
        isCompleted={deleteDialog.isCompleted}
      />
    </div>
  );
}
