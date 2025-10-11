// src/components/jerseys/TeamJerseyDetail.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team jersey detail container ONLY - coordinates child components
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { useTeamJersey } from "@/hooks/useTeamJersey";
import { useJerseyMutations } from "@/hooks/useJerseyMutations";
import JerseyDesignSection from "./JerseyDesignSection";
import PlayerJerseyTable from "./PlayerJerseyTable";
import GenericJerseySection from "./GenericJerseySection";
import JerseyEditionPopup from "./JerseyEditionPopup";
import UploadJerseyPopup from "./UploadJerseyPopup";

interface TeamJerseyDetailProps {
  teamId: string;
}

export default function TeamJerseyDetail({ teamId }: TeamJerseyDetailProps) {
  const router = useRouter();
  const { team, isLoading, error, refetch } = useTeamJersey(teamId);
  const {
    isUpdating,
    updateJerseyEdition,
    updateJerseyCustom,
    removeJerseyDesign,
    updatePlayerJersey,
    addGenericJersey,
    updateGenericJersey,
    removeGenericJersey,
  } = useJerseyMutations();

  const [showEditionPopup, setShowEditionPopup] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);

  const handleBack = () => {
    router.push("/admin/jerseys");
  };

  const handleDownloadCSV = () => {
    if (!team) return;

    const headers = [
      "Type",
      "Player Name",
      "Jersey Number",
      "Jersey Size",
      "Jersey Name",
      "Payment Status",
    ];
    const rows: string[][] = [];

    // Add players
    team.players.forEach((player) => {
      rows.push([
        "Player",
        player.playerName,
        player.jerseyNumber?.toString() || "",
        player.jerseySize || "",
        player.jerseyName || "",
        player.paymentStatus?.hasPaid ? "Paid" : "Not Paid",
      ]);
    });

    // Add generic jerseys
    team.genericJerseys?.forEach((generic, idx) => {
      rows.push([
        "Generic",
        `Generic Jersey ${idx + 1}`,
        generic.jerseyNumber?.toString() || "",
        generic.jerseySize || "",
        generic.jerseyName || "",
        "N/A",
      ]);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${team.teamName.replace(/\s+/g, "_")}_jerseys.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdition = async (data: {
    jerseyEdition: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
  }) => {
    await updateJerseyEdition({ teamId, ...data });
    refetch();
  };

  const handleSaveCustom = async (imageData: {
    id: string;
    url: string;
    publicId: string;
  }) => {
    await updateJerseyCustom({ teamId, imageData });
    refetch();
  };

  const handleRemoveDesign = async () => {
    if (window.confirm("Remove current jersey design?")) {
      await removeJerseyDesign(teamId);
      refetch();
    }
  };

  const handleUpdatePlayer = async (
    playerId: string,
    data: {
      jerseyNumber?: number | null;
      jerseySize?: string | null;
      jerseyName?: string | null;
    }
  ) => {
    await updatePlayerJersey({ playerId, ...data });
    refetch();
  };

  const handleAddGeneric = async (data: {
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }) => {
    await addGenericJersey({ teamId, ...data });
    refetch();
  };

  const handleUpdateGeneric = async (
    index: number,
    data: {
      jerseyNumber?: number;
      jerseySize?: string;
      jerseyName?: string;
    }
  ) => {
    await updateGenericJersey({ teamId, genericIndex: index, ...data });
    refetch();
  };

  const handleRemoveGeneric = async (index: number) => {
    await removeGenericJersey({ teamId, genericIndex: index });
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading team details: {error}</p>
          <button
            onClick={() => router.push("/jerseys")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !team) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow p-6 mb-6 h-64 animate-pulse"></div>
          <div className="bg-white rounded-lg shadow p-6 h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {team.jerseyEdition && (
                    <>
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow flex-shrink-0"
                        style={{ backgroundColor: team.primaryColor || "#999" }}
                      />
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow -ml-3 sm:-ml-4 flex-shrink-0"
                        style={{
                          backgroundColor: team.secondaryColor || "#666",
                        }}
                      />
                    </>
                  )}
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {team.teamName}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {team.division.divisionName} • {team.division.day} •{" "}
                  {team.division.level.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadCSV}
                className="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* Jersey Design Section */}
        <JerseyDesignSection
          team={team}
          onChooseEdition={() => setShowEditionPopup(true)}
          onUploadCustom={() => setShowUploadPopup(true)}
          onRemoveDesign={handleRemoveDesign}
        />

        {/* Team Players Section */}
        <PlayerJerseyTable
          players={team.players}
          onUpdatePlayer={handleUpdatePlayer}
        />

        {/* Generic Jerseys Section */}
        <GenericJerseySection
          genericJerseys={team.genericJerseys || []}
          teamId={teamId}
          onAddGeneric={handleAddGeneric}
          onUpdateGeneric={handleUpdateGeneric}
          onRemoveGeneric={handleRemoveGeneric}
        />
      </div>

      {/* Popups */}
      <JerseyEditionPopup
        isOpen={showEditionPopup}
        onClose={() => setShowEditionPopup(false)}
        onSave={handleSaveEdition}
      />

      <UploadJerseyPopup
        isOpen={showUploadPopup}
        onClose={() => setShowUploadPopup(false)}
        onSave={handleSaveCustom}
      />

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-900 font-medium">Updating...</p>
          </div>
        </div>
      )}
    </div>
  );
}
