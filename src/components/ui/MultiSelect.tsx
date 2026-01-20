import { useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";

interface MultiSelectProps<T> {
  label: string;
  selectedItems: T[];
  onChange: (items: T[]) => void;
  availableItems: T[];
  getDisplayValue: (item: T) => string;
  getItemId: (item: T) => string;
  renderItemDisplay?: (item: T) => React.ReactNode;
  renderDropdownItem?: (item: T) => React.ReactNode;
  placeholder?: string;
}

export function MultiSelect<T>({
  label,
  selectedItems,
  onChange,
  availableItems,
  getDisplayValue,
  getItemId,
  renderItemDisplay,
  renderDropdownItem,
  placeholder = "Select items...",
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleItem = (item: T) => {
    const itemId = getItemId(item);
    const isSelected = selectedItems.some((i) => getItemId(i) === itemId);
    if (isSelected) {
      onChange(selectedItems.filter((i) => getItemId(i) !== itemId));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  const removeItem = (item: T, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemId = getItemId(item);
    onChange(selectedItems.filter((i) => getItemId(i) !== itemId));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>

      {/* Selected Items Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] p-2 border border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
      >
        {selectedItems.length === 0 ? (
          <span className="text-sm text-slate-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.map((item) => (
              <div
                key={getItemId(item)}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm font-medium"
              >
                {renderItemDisplay ? renderItemDisplay(item) : <span>{getDisplayValue(item)}</span>}
                <button
                  type="button"
                  onClick={(e) => removeItem(item, e)}
                  className="hover:bg-indigo-200 rounded p-0.5 transition-colors"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="p-1">
              {availableItems.map((item) => {
                const itemId = getItemId(item);
                const isSelected = selectedItems.some((i) => getItemId(i) === itemId);
                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {renderDropdownItem ? renderDropdownItem(item) : <span className="flex-1 text-left">{getDisplayValue(item)}</span>}
                    {isSelected && <IconCheck size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
