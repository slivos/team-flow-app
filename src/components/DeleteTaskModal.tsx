import { useEffect } from "react";
import { IconAlertCircle } from "@tabler/icons-react";
import { Button } from "./ui";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export function DeleteTaskModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}: DeleteTaskModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Disable body scroll when modal is open
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <IconAlertCircle size={24} className="text-red-600" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Task?</h2>

          {/* Description */}
          <p className="text-slate-600 mb-2">
            Are you sure you want to delete <span className="font-semibold text-slate-800">"{taskTitle}"</span>?
          </p>
          <p className="text-sm text-slate-500 mb-6">
            This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
