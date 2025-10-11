// src/components/features/league/divisions/DivisionCard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Single division card display ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Pencil,
  Power,
  UserCheck,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PopulatedDivision } from "@/types/division";
import Link from "next/link";

interface DivisionCardProps {
  division: PopulatedDivision;
}

export function DivisionCard({ division }: DivisionCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = () => {
    const badges: JSX.Element[] = [];

    if (!division.active && !division.register) {
      badges.push(
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200"
        >
          Finished
        </Badge>
      );
    }
    if (division.register) {
      badges.push(
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200"
        >
          Registration
        </Badge>
      );
    }
    if (division.active && !division.register) {
      badges.push(
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Active - Closed
        </Badge>
      );
    }
    if (division.active && division.register) {
      badges.push(
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200"
        >
          Active - Open
        </Badge>
      );
    }

    return badges;
  };

  const handleToggleActive = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/divisions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: division._id,
          active: !division.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update division");

      toast.success(
        `Division ${division.active ? "deactivated" : "activated"}`
      );
      router.refresh();
    } catch (error) {
      toast.error("Failed to update division status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRegister = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/divisions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: division._id,
          register: !division.register,
        }),
      });

      if (!response.ok) throw new Error("Failed to update division");

      toast.success(`Registration ${division.register ? "closed" : "opened"}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update registration status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">{getStatusBadge()}</div>
            <Link href={`/admin/league/divisions/${division._id}`}>
              <h3 className="font-semibold text-lg leading-tight hover:underline">
                {division.divisionName}
              </h3>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isUpdating}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/league/divisions/${division._id}/edit`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Division
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleActive}>
                <Power className="mr-2 h-4 w-4" />
                {division.active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleRegister}>
                <UserCheck className="mr-2 h-4 w-4" />
                {division.register ? "Close Registration" : "Open Registration"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/league/teams?division=${division._id}`)
                }
              >
                <Users className="mr-2 h-4 w-4" />
                View Teams
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{division.location?.name}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <TrendingUp className="h-4 w-4 flex-shrink-0" />
          <span>Level: {division.level?.name}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{division.day}s</span>
        </div>

        {division.startTime && division.endTime && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {division.startTime} - {division.endTime}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4 flex-shrink-0" />
          <span>{(division as any).teamCount || 0} teams</span>
        </div>

        {(division as any).freeAgentCounts && (
          <div className="flex items-center gap-2 text-gray-600">
            <UserCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              {(division as any).freeAgentCounts.total} free agents
              {(division as any).freeAgentCounts.total > 0 && (
                <span className="text-xs text-gray-500 ml-1">
                  ({(division as any).freeAgentCounts.withTeam} with team, {(division as any).freeAgentCounts.withoutTeam} unassigned)
                </span>
              )}
            </span>
          </div>
        )}

        {division.startDate && (
          <div className="pt-2 border-t text-gray-600">
            <span className="text-xs">
              Starts: {format(new Date(division.startDate), "MMM dd, yyyy")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
