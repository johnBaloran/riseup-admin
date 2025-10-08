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
import { Trophy, Mail, User, MoreVertical, Pencil } from "lucide-react";
import { InstallmentProgress } from "@/components/features/payments/InstallmentProgress";

interface PlayerCardProps {
  player: any;
  cityId: string;
}

export function PlayerCard({ player, cityId }: PlayerCardProps) {
  const router = useRouter();

  const getPaymentBadge = () => {
    if (player.paymentStatus === "paid") {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Paid
        </Badge>
      );
    }

    if (player.paymentStatus === "in_progress") {
      return (
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Installments
          </Badge>
          {player.installmentProgress && (
            <InstallmentProgress
              payments={player.installmentProgress}
              size="sm"
            />
          )}
        </div>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-red-100 text-red-800 border-red-200"
      >
        Unpaid
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getPaymentBadge()}
              {!player.team && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  Free Agent
                </Badge>
              )}
            </div>
            <Link href={`/admin/league/players/${player._id}`}>
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
                  router.push(`/admin/league/players/${player._id}/edit`)
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
          <span>
            {player.team?.teamName || "Free Agent"} -{" "}
            {player.division?.divisionName || "N/A"}
          </span>
        </div>

        {player.user && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{player.user.email}</span>
          </div>
        )}

        {!player.user && (
          <div className="flex items-center gap-2 text-gray-500">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs">No user account linked</span>
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
