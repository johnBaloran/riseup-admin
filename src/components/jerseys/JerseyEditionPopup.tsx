// src/components/jerseys/JerseyEditionPopup.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey edition selection popup ONLY
 */

"use client";

import { useState } from "react";
import { X, CheckCircle, Shirt } from "lucide-react";

const jerseyEditions = [
  { id: "retro-1", name: "Retro 1", description: "Classic vintage style" },
  { id: "retro-2", name: "Retro 2", description: "Old school design" },
  { id: "classic-1", name: "Classic 1", description: "Traditional look" },
  { id: "classic-2", name: "Classic 2", description: "Timeless design" },
  { id: "modern-1", name: "Modern 1", description: "Contemporary style" },
  { id: "modern-2", name: "Modern 2", description: "Sleek and bold" },
];

interface JerseyEditionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    jerseyEdition: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
  }) => Promise<void>;
}

export default function JerseyEditionPopup({
  isOpen,
  onClose,
  onSave,
}: JerseyEditionPopupProps) {
  const [step, setStep] = useState(1);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [colors, setColors] = useState({
    primary: "#1E40AF",
    secondary: "#FBBF24",
    tertiary: "#FFFFFF",
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selectedEdition) {
      await onSave({
        jerseyEdition: selectedEdition,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        tertiaryColor: colors.tertiary,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedEdition(null);
    setColors({
      primary: "#1E40AF",
      secondary: "#FBBF24",
      tertiary: "#FFFFFF",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? "Choose Jersey Edition" : "Select Team Colors"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 1
                ? "Select a jersey design for your team"
                : "Choose primary, secondary, and tertiary colors"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            /* Step 1: Edition Selection */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jerseyEditions.map((edition) => (
                <div
                  key={edition.id}
                  onClick={() => setSelectedEdition(edition.id)}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedEdition === edition.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Selected Indicator */}
                  {selectedEdition === edition.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}

                  {/* Jersey Image Placeholder */}
                  <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <Shirt size={64} className="text-gray-400" />
                  </div>

                  {/* Edition Info */}
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {edition.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {edition.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Step 2: Color Selection */
            <div className="max-w-2xl mx-auto">
              {/* Selected Edition Preview */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shirt size={48} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Selected Edition</p>
                    <p className="text-xl font-bold text-gray-900">
                      {
                        jerseyEditions.find((e) => e.id === selectedEdition)
                          ?.name
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Pickers */}
              <div className="space-y-6">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={colors.primary}
                      onChange={(e) =>
                        setColors({ ...colors, primary: e.target.value })
                      }
                      className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={colors.primary}
                        onChange={(e) =>
                          setColors({ ...colors, primary: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#1E40AF"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Main team color
                      </p>
                    </div>
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) =>
                        setColors({ ...colors, secondary: e.target.value })
                      }
                      className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={colors.secondary}
                        onChange={(e) =>
                          setColors({ ...colors, secondary: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#FBBF24"
                      />
                      <p className="text-xs text-gray-500 mt-1">Accent color</p>
                    </div>
                  </div>
                </div>

                {/* Tertiary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tertiary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={colors.tertiary}
                      onChange={(e) =>
                        setColors({ ...colors, tertiary: e.target.value })
                      }
                      className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={colors.tertiary}
                        onChange={(e) =>
                          setColors({ ...colors, tertiary: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#FFFFFF"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Additional detail color
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Color Preview
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div
                      className="w-16 h-16 rounded-full border-2 border-white shadow-lg -ml-4"
                      style={{ backgroundColor: colors.secondary }}
                    />
                    <div
                      className="w-16 h-16 rounded-full border-2 border-white shadow-lg -ml-4"
                      style={{ backgroundColor: colors.tertiary }}
                    />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Team colors</p>
                      <p className="text-xs text-gray-500 mt-1">
                        How your colors will appear
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            {step === 1 ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedEdition}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Colors
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Back to Editions
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Jersey Design
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
