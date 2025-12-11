'use client';

import React from "react";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-2">{title || "Are you sure?"}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message || "This action cannot be undone."}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
