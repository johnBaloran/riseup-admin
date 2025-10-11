// src/components/jerseys/JerseyDesignSection.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display and manage jersey design ONLY
 */

"use client";

import { Image, Shirt, Upload, Trash2, AlertCircle } from "lucide-react";
import { TeamJerseyDetails } from "@/types/jersey";

interface JerseyDesignSectionProps {
  team: TeamJerseyDetails;
  onChooseEdition: () => void;
  onUploadCustom: () => void;
  onRemoveDesign: () => void;
}

export default function JerseyDesignSection({
  team,
  onChooseEdition,
  onUploadCustom,
  onRemoveDesign,
}: JerseyDesignSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Jersey Design
      </h2>

      {team.isCustomJersey ? (
        // Custom Jersey State
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Image size={40} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-lg">
                Custom Jersey Design
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Custom design uploaded
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onUploadCustom}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Upload size={16} />
                Replace
              </button>
              <button
                onClick={onRemoveDesign}
                className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : team.jerseyEdition ? (
        // Edition Jersey State
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shirt size={40} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-lg">
                Edition: {team.jerseyEdition}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Standard edition jersey
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onRemoveDesign}
                className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Remove Design
              </button>
            </div>
          </div>
          {/* Colors */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Primary:</span>
              <div
                className="w-10 h-10 rounded border-2 border-gray-300"
                style={{ backgroundColor: team.primaryColor || "#999" }}
              />
              <span className="text-xs text-gray-500">{team.primaryColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Secondary:</span>
              <div
                className="w-10 h-10 rounded border-2 border-gray-300"
                style={{ backgroundColor: team.secondaryColor || "#666" }}
              />
              <span className="text-xs text-gray-500">
                {team.secondaryColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tertiary:</span>
              <div
                className="w-10 h-10 rounded border-2 border-gray-300"
                style={{ backgroundColor: team.tertiaryColor || "#333" }}
              />
              <span className="text-xs text-gray-500">
                {team.tertiaryColor}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // No Design State
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <AlertCircle size={56} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            No jersey design selected
          </p>
          <p className="text-gray-600 mb-6 text-sm">
            Choose an edition or upload a custom design
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onChooseEdition}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Shirt size={18} />
              Choose Edition
            </button>
            <button
              onClick={onUploadCustom}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <Upload size={18} />
              Upload Custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
