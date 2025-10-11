// src/components/jerseys/JerseyDesignSection.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display and manage jersey design ONLY
 */

"use client";

import { useState } from "react";
import { Image, Shirt, Upload, Trash2, AlertCircle, X } from "lucide-react";
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
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
        Jersey Design
      </h2>

      {team.isCustomJersey ? (
        // Custom Jersey State
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {team.jerseyImages && team.jerseyImages.length > 0 ? (
              <button
                onClick={() => setShowImageModal(true)}
                className="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer group relative"
              >
                <img
                  src={team.jerseyImages[0].url}
                  alt="Custom Jersey Design"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                    View
                  </span>
                </div>
              </button>
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image size={40} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-base sm:text-lg">
                Custom Jersey Design
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Custom design uploaded
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={onUploadCustom}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                Replace
              </button>
              <button
                onClick={onRemoveDesign}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-red-300 rounded-lg text-xs sm:text-sm font-medium text-red-700 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : team.jerseyEdition ? (
        // Edition Jersey State
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shirt size={40} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-base sm:text-lg">
                Edition: {team.jerseyEdition}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Standard edition jersey
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={onRemoveDesign}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-red-300 rounded-lg text-xs sm:text-sm font-medium text-red-700 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Remove Design</span>
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          </div>
          {/* Colors */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Primary:</span>
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: team.primaryColor || "#999" }}
              />
              <span className="text-xs text-gray-500 truncate">{team.primaryColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Secondary:</span>
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: team.secondaryColor || "#666" }}
              />
              <span className="text-xs text-gray-500 truncate">
                {team.secondaryColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Tertiary:</span>
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: team.tertiaryColor || "#333" }}
              />
              <span className="text-xs text-gray-500 truncate">
                {team.tertiaryColor}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // No Design State
        <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center">
          <AlertCircle size={48} className="sm:w-14 sm:h-14 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2 text-sm sm:text-base">
            No jersey design selected
          </p>
          <p className="text-gray-600 mb-6 text-xs sm:text-sm">
            Choose an edition or upload a custom design
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onChooseEdition}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center justify-center gap-2"
            >
              <Shirt size={18} />
              Choose Edition
            </button>
            <button
              onClick={onUploadCustom}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 inline-flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Upload Custom
            </button>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && team.jerseyImages && team.jerseyImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={team.jerseyImages[0].url}
              alt="Custom Jersey Design"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
