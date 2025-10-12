// src/components/jerseys/PlayerJerseyTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display and edit player jersey details ONLY
 */

"use client";

import { useState } from "react";
import {
  Edit2,
  Check,
  X,
  AlertCircle,
  DollarSign,
  UserX,
  Users,
  Copy,
  Table2,
  Edit,
} from "lucide-react";

interface Player {
  _id: string;
  playerName: string;
  jerseyNumber?: number;
  jerseySize?: string;
  jerseyName?: string;
  user?: string;
  paymentStatus?: {
    hasPaid?: boolean;
  };
}

interface GenericJersey {
  jerseyNumber?: number;
  jerseySize?: string;
  jerseyName?: string;
}

interface PlayerJerseyTableProps {
  players: Player[];
  genericJerseys?: GenericJersey[];
  onUpdatePlayer: (
    playerId: string,
    data: {
      jerseyNumber?: number | null;
      jerseySize?: string | null;
      jerseyName?: string | null;
    }
  ) => Promise<void>;
}

export default function PlayerJerseyTable({
  players,
  genericJerseys = [],
  onUpdatePlayer,
}: PlayerJerseyTableProps) {
  const [viewMode, setViewMode] = useState<"edit" | "summary">("edit");
  const [copied, setCopied] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    jerseyNumber: string;
    jerseySize: string;
    jerseyName: string;
  }>({ jerseyNumber: "", jerseySize: "", jerseyName: "" });

  const playersWithDetails = players.filter(
    (p) => p.jerseyNumber != null && p.jerseySize != null
  );

  const handleCopyToClipboard = () => {
    // Create tab-separated values for easy paste into Google Sheets
    const headers = ["Jersey Name", "Jersey Number", "Size"];
    const rows: string[][] = [];

    // Add players
    players.forEach((player) => {
      rows.push([
        player.jerseyName || "",
        player.jerseyNumber?.toString() || "",
        player.jerseySize || "",
      ]);
    });

    // Add generic jerseys
    genericJerseys.forEach((generic) => {
      rows.push([
        generic.jerseyName || "",
        generic.jerseyNumber?.toString() || "",
        generic.jerseySize || "",
      ]);
    });

    // Create tab-separated string
    const tsvContent = [
      headers.join("\t"),
      ...rows.map((row) => row.join("\t")),
    ].join("\n");

    // Copy to clipboard
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartEdit = (player: Player) => {
    setEditingPlayer(player._id);
    setEditValues({
      jerseyNumber: player.jerseyNumber?.toString() || "",
      jerseySize: player.jerseySize || "",
      jerseyName: player.jerseyName || "",
    });
  };

  const handleSaveEdit = async (playerId: string) => {
    await onUpdatePlayer(playerId, {
      jerseyNumber: editValues.jerseyNumber
        ? parseInt(editValues.jerseyNumber)
        : null,
      jerseySize: editValues.jerseySize || null,
      jerseyName: editValues.jerseyName || null,
    });
    setEditingPlayer(null);
    setEditValues({ jerseyNumber: "", jerseySize: "", jerseyName: "" });
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setEditValues({ jerseyNumber: "", jerseySize: "", jerseyName: "" });
  };

  const totalJerseys = players.length + genericJerseys.length;

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {viewMode === "edit" ? (
            <>
              Team Players & Jerseys
              <span className="ml-2 text-xs sm:text-sm font-normal text-gray-600">
                ({playersWithDetails.length}/{players.length} players complete)
              </span>
            </>
          ) : (
            <>
              Jersey Summary
              <span className="ml-2 text-xs sm:text-sm font-normal text-gray-600">
                ({totalJerseys} total jerseys)
              </span>
            </>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "edit" ? "summary" : "edit")}
            className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 inline-flex items-center gap-2 justify-center"
          >
            {viewMode === "edit" ? (
              <>
                <Table2 size={16} />
                <span className="hidden sm:inline">Summary View</span>
                <span className="sm:hidden">Summary</span>
              </>
            ) : (
              <>
                <Edit size={16} />
                <span className="hidden sm:inline">Edit View</span>
                <span className="sm:hidden">Edit</span>
              </>
            )}
          </button>
          {viewMode === "summary" && (
            <button
              onClick={handleCopyToClipboard}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2 justify-center"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="hidden sm:inline">Copy for Sheets</span>
                  <span className="sm:hidden">Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {viewMode === "summary" ? (
        // Summary View - Combined Players and Generic Jerseys
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                        Jersey Name
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                        Number
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {players.map((player) => (
                      <tr key={player._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 font-medium">
                          {player.jerseyName || "-"}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                          {player.jerseyNumber != null
                            ? `${player.jerseyNumber}`
                            : "-"}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                          {player.jerseySize || "-"}
                        </td>
                      </tr>
                    ))}
                    {genericJerseys.map((generic, idx) => (
                      <tr key={`generic-${idx}`} className="hover:bg-gray-50 bg-purple-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 font-medium">
                          {generic.jerseyName || "-"}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                          {generic.jerseyNumber != null
                            ? `${generic.jerseyNumber}`
                            : "-"}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 whitespace-nowrap">
                          {generic.jerseySize || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : players.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Player Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Number
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Size
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Jersey Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Payment
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {players.map((player) => {
                  const isEditing = editingPlayer === player._id;

                  return (
                    <tr key={player._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {player.playerName}
                          </span>
                          {!player.user && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded flex-shrink-0"
                              title="No user account"
                            >
                              <UserX size={12} />
                            </span>
                          )}
                        </div>
                      </td>

                      {isEditing ? (
                        <>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <input
                              type="number"
                              value={editValues.jerseyNumber}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  jerseyNumber: e.target.value,
                                })
                              }
                              className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="23"
                            />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <select
                              value={editValues.jerseySize}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  jerseySize: e.target.value,
                                })
                              }
                              className="w-20 sm:w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-</option>
                              <option value="SM">SM</option>
                              <option value="MD">MD</option>
                              <option value="LG">LG</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                            </select>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <input
                              type="text"
                              value={editValues.jerseyName}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  jerseyName: e.target.value,
                                })
                              }
                              className="w-24 sm:w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="DOE"
                              maxLength={15}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm whitespace-nowrap">
                            {player.jerseyNumber != null ? (
                              <span className="text-gray-900">
                                #{player.jerseyNumber}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded whitespace-nowrap">
                                <AlertCircle size={12} />
                                <span className="hidden sm:inline">Missing</span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm whitespace-nowrap">
                            {player.jerseySize ? (
                              <span className="text-gray-900">
                                {player.jerseySize}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded whitespace-nowrap">
                                <AlertCircle size={12} />
                                <span className="hidden sm:inline">Missing</span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">
                            {player.jerseyName || "-"}
                          </td>
                        </>
                      )}

                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                        {player.paymentStatus?.hasPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                            <DollarSign size={14} />
                            <span className="hidden sm:inline">Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full whitespace-nowrap">
                            <AlertCircle size={14} />
                            <span className="hidden sm:inline">Not Paid</span>
                          </span>
                        )}
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(player._id)}
                              className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(player)}
                            className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Users size={56} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No players on this team yet</p>
        </div>
      )}
    </div>
  );
}
