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

interface PlayerJerseyTableProps {
  players: Player[];
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
  onUpdatePlayer,
}: PlayerJerseyTableProps) {
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    jerseyNumber: string;
    jerseySize: string;
    jerseyName: string;
  }>({ jerseyNumber: "", jerseySize: "", jerseyName: "" });

  const playersWithDetails = players.filter(
    (p) => p.jerseyNumber != null && p.jerseySize != null
  );

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

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Team Players
        <span className="ml-2 text-sm font-normal text-gray-600">
          ({playersWithDetails.length}/{players.length} complete)
        </span>
      </h2>

      {players.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Player Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Jersey Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Jersey Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {players.map((player) => {
                  const isEditing = editingPlayer === player._id;

                  return (
                    <tr key={player._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          {player.playerName}
                          {!player.user && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              title="No user account"
                            >
                              <UserX size={12} />
                            </span>
                          )}
                        </div>
                      </td>

                      {isEditing ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editValues.jerseyNumber}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  jerseyNumber: e.target.value,
                                })
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="23"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editValues.jerseySize}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  jerseySize: e.target.value,
                                })
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="2XL">2XL</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editValues.jerseyName}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  jerseyName: e.target.value,
                                })
                              }
                              className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="DOE"
                              maxLength={15}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm">
                            {player.jerseyNumber != null ? (
                              <span className="text-gray-900">
                                #{player.jerseyNumber}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                <AlertCircle size={12} />
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {player.jerseySize ? (
                              <span className="text-gray-900">
                                {player.jerseySize}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                <AlertCircle size={12} />
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {player.jerseyName || "-"}
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4 text-sm">
                        {player.paymentStatus?.hasPaid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <DollarSign size={14} />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            <AlertCircle size={14} />
                            Not Paid
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(player._id)}
                              className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(player)}
                            className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={18} />
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
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Users size={56} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No players on this team yet</p>
        </div>
      )}
    </div>
  );
}
