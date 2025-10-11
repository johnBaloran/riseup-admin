// src/components/jerseys/UploadJerseyPopup.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Upload custom jersey popup ONLY
 */

"use client";

import { X, UploadCloud } from "lucide-react";

interface UploadJerseyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: {
    id: string;
    url: string;
    publicId: string;
  }) => Promise<void>;
}

export default function UploadJerseyPopup({
  isOpen,
  onClose,
  onSave,
}: UploadJerseyPopupProps) {
  if (!isOpen) return null;

  const handleSave = async () => {
    // TODO: Implement file upload functionality
    // For now, just show alert
    alert(
      "File upload functionality to be implemented. This will integrate with Cloudinary or your file storage service."
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upload Custom Jersey
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload your team's custom jersey design
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Drag and Drop Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
            <UploadCloud size={64} className="text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop your jersey image here
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse files
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Select File
            </button>
          </div>

          {/* File Requirements */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              File Requirements:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supported formats: PNG, JPG, JPEG</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Recommended dimensions: 1000x1000px or higher</li>
              <li>• Transparent background recommended for PNG files</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Upload & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
