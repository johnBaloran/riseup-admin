// src/components/features/league/teams/SwitchDivisionDialog.tsx

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, MapPin, Calendar, TrendingUp, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatTimeRange } from "@/lib/utils/time";

interface Division {
  _id: string;
  divisionName: string;
  city: { _id: string; cityName: string };
  location: { name: string };
  startDate: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  level?: { grade: string; name: string };
  active: boolean;
  register: boolean;
}

interface SwitchDivisionDialogProps {
  teamId: string;
  currentDivisionId: string;
  activeDivisions: Division[];
  registrationDivisions: Division[];
}

export function SwitchDivisionDialog({
  teamId,
  currentDivisionId,
  activeDivisions,
  registrationDivisions,
}: SwitchDivisionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitchDivision = async (newDivisionId: string) => {
    try {
      setSwitching(true);
      const response = await fetch(`/api/v1/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ division: newDivisionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to switch division");
      }

      toast.success("Division switched successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error switching division:", error);
      toast.error(error.message || "Failed to switch division");
    } finally {
      setSwitching(false);
    }
  };

  const renderDivisionCard = (division: Division) => {
    const isCurrentDivision = division._id === currentDivisionId;

    return (
      <div
        key={division._id}
        className={`border rounded-lg p-4 ${
          isCurrentDivision
            ? "bg-blue-50 border-blue-200"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">
                {division.divisionName}
              </h4>
              {isCurrentDivision && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  Current
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                <span>{division.city.cityName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{division.location.name}</span>
              </div>
              {(division.day || division.startTime || division.endTime) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {division.day && `${division.day}s`}
                    {division.startTime && division.endTime && `, ${formatTimeRange(division.startTime, division.endTime)}`}
                  </span>
                </div>
              )}
              {division.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Starts {format(new Date(division.startDate), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {division.level && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>{division.level.name}</span>
                </div>
              )}
            </div>
          </div>

          {!isCurrentDivision && (
            <Button
              size="sm"
              onClick={() => handleSwitchDivision(division._id)}
              disabled={switching}
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
          <DialogTitle>Switch Division</DialogTitle>
          <DialogDescription>
            Move this team to a different division. Only active divisions and
            divisions with registration open are available.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Divisions ({activeDivisions.length})
            </TabsTrigger>
            <TabsTrigger value="registration">
              Registration Open ({registrationDivisions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {activeDivisions.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No active divisions available
              </div>
            ) : (
              activeDivisions.map(renderDivisionCard)
            )}
          </TabsContent>

          <TabsContent value="registration" className="space-y-3 mt-4">
            {registrationDivisions.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No divisions with registration open
              </div>
            ) : (
              registrationDivisions.map(renderDivisionCard)
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Note:</span> Switching divisions
            will move the team and all its players to the selected division.
            Make sure this is the correct division before switching.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
