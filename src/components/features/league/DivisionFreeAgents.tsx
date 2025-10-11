// src/components/features/league/DivisionFreeAgents.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display free agents in a division ONLY
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Users, Mail, Phone, CheckCircle2, XCircle, Instagram } from "lucide-react";

interface Player {
  _id: string;
  playerName: string;
  team?: {
    teamName: string;
    teamCode: string;
  } | null;
  user?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  instagram?: string;
  jerseyNumber?: number;
  createdAt: Date;
}

interface DivisionFreeAgentsProps {
  players: Player[];
}

export function DivisionFreeAgents({ players }: DivisionFreeAgentsProps) {
  const freeAgentsWithTeam = players.filter((p) => p.team);
  const freeAgentsWithoutTeam = players.filter((p) => !p.team);

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Free Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No free agents in this division
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Free Agents ({players.length})
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Players marked as free agents in this division
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Free Agents with Teams */}
        {freeAgentsWithTeam.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-sm">
                On a Team ({freeAgentsWithTeam.length})
              </h3>
            </div>
            <div className="space-y-2">
              {freeAgentsWithTeam.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                      <UserCircle className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{player.playerName}</p>
                      {player.user?.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Mail className="h-3 w-3" />
                          {player.user.email}
                        </div>
                      )}
                      {player.instagram && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Instagram className="h-3 w-3" />
                          @{player.instagram}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-600 text-white">
                      <Users className="h-3 w-3 mr-1" />
                      {player.team?.teamName}
                    </Badge>
                    {player.jerseyNumber && (
                      <p className="text-xs text-gray-500 mt-1">
                        #{player.jerseyNumber}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Agents without Teams */}
        {freeAgentsWithoutTeam.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-amber-600" />
              <h3 className="font-medium text-sm">
                No Team ({freeAgentsWithoutTeam.length})
              </h3>
            </div>
            <div className="space-y-2">
              {freeAgentsWithoutTeam.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                      <UserCircle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{player.playerName}</p>
                      {player.user?.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Mail className="h-3 w-3" />
                          {player.user.email}
                        </div>
                      )}
                      {player.user?.phoneNumber && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="h-3 w-3" />
                          {player.user.phoneNumber}
                        </div>
                      )}
                      {player.instagram && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Instagram className="h-3 w-3" />
                          @{player.instagram}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Unassigned
                    </Badge>
                    {player.jerseyNumber && (
                      <p className="text-xs text-gray-500 mt-1">
                        #{player.jerseyNumber}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
