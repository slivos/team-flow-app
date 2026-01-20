import type { Tag } from "../../types";
import { MultiSelect } from "./MultiSelect";

interface LabelSelectProps {
  label: string;
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  availableTags: Tag[];
}

export function LabelSelect({
  label,
  selectedTags,
  onChange,
  availableTags,
}: LabelSelectProps) {
  return (
    <MultiSelect
      label={label}
      selectedItems={selectedTags}
      onChange={onChange}
      availableItems={availableTags}
      getDisplayValue={(tag) => tag.name}
      getItemId={(tag) => tag.id}
      placeholder="Select labels..."
      renderItemDisplay={(tag) => (
        <>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          <span>{tag.name}</span>
        </>
      )}
      renderDropdownItem={(tag) => (
        <>
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          <span className="flex-1 text-left">{tag.name}</span>
        </>
      )}
    />
  );
}
