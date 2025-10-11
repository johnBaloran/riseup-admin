// src/components/jerseys/GenericJerseySection.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display and manage generic jerseys ONLY
 */

"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import { GenericJersey } from "@/types/jersey";

interface GenericJerseySectionProps {
  genericJerseys: GenericJersey[];
  teamId: string;
  onAddGeneric: (data: {
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }) => Promise<void>;
  onUpdateGeneric: (
    index: number,
    data: {
      jerseyNumber?: number;
      jerseySize?: string;
      jerseyName?: string;
    }
  ) => Promise<void>;
  onRemoveGeneric: (index: number) => Promise<void>;
}

export default function GenericJerseySection({
  genericJerseys,
  teamId,
  onAddGeneric,
  onUpdateGeneric,
  onRemoveGeneric,
}: GenericJerseySectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newGeneric, setNewGeneric] = useState({
    jerseyNumber: "",
    jerseySize: "",
    jerseyName: "",
  });
  const [editValues, setEditValues] = useState({
    jerseyNumber: "",
    jerseySize: "",
    jerseyName: "",
  });

  const handleAdd = async () => {
    await onAddGeneric({
      jerseyNumber: newGeneric.jerseyNumber
        ? parseInt(newGeneric.jerseyNumber)
        : undefined,
      jerseySize: newGeneric.jerseySize || undefined,
      jerseyName: newGeneric.jerseyName || undefined,
    });
    setNewGeneric({ jerseyNumber: "", jerseySize: "", jerseyName: "" });
    setShowAddForm(false);
  };

  const handleStartEdit = (index: number, generic: GenericJersey) => {
    setEditingIndex(index);
    setEditValues({
      jerseyNumber: generic.jerseyNumber?.toString() || "",
      jerseySize: generic.jerseySize || "",
      jerseyName: generic.jerseyName || "",
    });
  };

  const handleSaveEdit = async (index: number) => {
    await onUpdateGeneric(index, {
      jerseyNumber: editValues.jerseyNumber
        ? parseInt(editValues.jerseyNumber)
        : undefined,
      jerseySize: editValues.jerseySize || undefined,
      jerseyName: editValues.jerseyName || undefined,
    });
    setEditingIndex(null);
    setEditValues({ jerseyNumber: "", jerseySize: "", jerseyName: "" });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValues({ jerseyNumber: "", jerseySize: "", jerseyName: "" });
  };

  const handleRemove = async (index: number) => {
    if (window.confirm("Remove this generic jersey?")) {
      await onRemoveGeneric(index);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Generic/Extra Jerseys
          <span className="ml-2 text-sm font-normal text-gray-600">
            ({genericJerseys.length} jerseys)
          </span>
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add Generic Jersey
        </button>
      </div>

      {/* Add Generic Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Add Generic Jersey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jersey Number
              </label>
              <input
                type="number"
                value={newGeneric.jerseyNumber}
                onChange={(e) =>
                  setNewGeneric({ ...newGeneric, jerseyNumber: e.target.value })
                }
                placeholder="99"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                value={newGeneric.jerseySize}
                onChange={(e) =>
                  setNewGeneric({ ...newGeneric, jerseySize: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="2XL">2XL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jersey Name
              </label>
              <input
                type="text"
                value={newGeneric.jerseyName}
                onChange={(e) =>
                  setNewGeneric({ ...newGeneric, jerseyName: e.target.value })
                }
                placeholder="EXTRA"
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Add Jersey
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewGeneric({
                  jerseyNumber: "",
                  jerseySize: "",
                  jerseyName: "",
                });
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Generic Jerseys Table */}
      {genericJerseys.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {genericJerseys.map((generic, index) => {
                  const isEditing = editingIndex === index;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
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
                              placeholder="99"
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
                              placeholder="EXTRA"
                              maxLength={15}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm">
                            {generic.jerseyNumber != null ? (
                              <span className="text-gray-900">
                                #{generic.jerseyNumber}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                <AlertCircle size={12} />
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {generic.jerseySize ? (
                              <span className="text-gray-900">
                                {generic.jerseySize}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                <AlertCircle size={12} />
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {generic.jerseyName || "-"}
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4 text-sm">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(index)}
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartEdit(index, generic)}
                              className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleRemove(index)}
                              className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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
          <Package size={56} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No generic jerseys added yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add extra jerseys for late joiners or additional players
          </p>
        </div>
      )}
    </div>
  );
}
