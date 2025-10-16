// src/components/features/league/players/PlayerCard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Single player card display ONLY
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trophy,
  Mail,
  User,
  MoreVertical,
  Pencil,
  MapPin,
  Users,
} from "lucide-react";

interface PlayerCardProps {
  player: any;
  cityId: string;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {player.freeAgent && player.team && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Free Agent • {player.team.teamName}
                </Badge>
              )}
              {player.freeAgent && !player.team && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  Free Agent • Unassigned
                </Badge>
              )}
              {!player.freeAgent && !player.team && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  Unassigned
                </Badge>
              )}
              {!player.user && (
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-800 border-gray-200"
                >
                  No Account
                </Badge>
              )}
            </div>
            <Link href={`/league/players/${player._id}`}>
              <h3 className="font-semibold text-lg leading-tight hover:underline">
                {player.playerName}
              </h3>
            </Link>
            {player.jerseyNumber && (
              <p className="text-sm text-gray-500">#{player.jerseyNumber}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/league/players/${player._id}/edit`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Player
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Trophy className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {player.team?.teamName || "Free Agent"}
            {player.division?.divisionName &&
              ` - ${player.division.divisionName}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {player.division?.location?.name || "N/A"}
            {player.division?.city?.cityName &&
              `, ${player.division.city.cityName}`}
          </span>
        </div>

        {player.user && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{player.user.email}</span>
          </div>
        )}

        {player.jerseySize && (
          <div className="pt-2 border-t">
            <span className="text-xs text-gray-500">Jersey: </span>
            <span className="text-xs font-medium">
              {player.jerseySize}
              {player.jerseyName && ` - ${player.jerseyName}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
