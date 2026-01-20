import type { Assignee } from "../../types";
import { MultiSelect } from "./MultiSelect";

interface AssigneeSelectProps {
  label: string;
  selectedAssignees: Assignee[];
  onChange: (assignees: Assignee[]) => void;
  availableUsers: Assignee[];
}

export function AssigneeSelect({
  label,
  selectedAssignees,
  onChange,
  availableUsers,
}: AssigneeSelectProps) {
  return (
    <MultiSelect
      label={label}
      selectedItems={selectedAssignees}
      onChange={onChange}
      availableItems={availableUsers}
      getDisplayValue={(user) => user.name}
      getItemId={(user) => user.id}
      placeholder="Select assignees..."
      renderItemDisplay={(user) => (
        <>
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=6366f1&color=fff&size=24`
            }
            alt={user.name}
            className="w-4 h-4 rounded-full"
          />
          <span>{user.name}</span>
        </>
      )}
      renderDropdownItem={(user) => (
        <>
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random&size=32`
            }
            alt={user.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="flex-1 text-left">{user.name}</span>
        </>
      )}
    />
  );
}
