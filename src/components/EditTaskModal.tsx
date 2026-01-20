import { useState, useEffect } from "react";
import type { Priority, Card as CardType, Assignee, Tag } from "../types";
import useBoardStore from "../store/boardStore";
import {
  Modal,
  TextInput,
  Select,
  Button,
  AssigneeSelect,
  LabelSelect,
  DateInput,
} from "./ui";
import { mockUsers } from "../data/users";
import { mockTags } from "../data/tags";

interface EditTaskModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ card, isOpen, onClose }: EditTaskModalProps) {
  const updateCard = useBoardStore((state) => state.updateCard);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setPriority(card.priority || "medium");
      setDueDate(card.dueDate || "");
      setAssignees(card.assignees || []);
      setTags(card.tags || []);
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateCard(
      card.id,
      title.trim(),
      description.trim() || undefined,
      priority,
      tags.length > 0 ? tags : undefined,
      assignees.length > 0 ? assignees : undefined,
      dueDate || undefined,
    );

    onClose();
  };

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col max-h-[calc(90vh-8rem)]"
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 pt-0 overflow-y-auto flex-1 space-y-4">
            <TextInput
              label="Title"
              value={title}
              onChange={setTitle}
              placeholder="Enter task title"
              required
              autoFocus
            />

            <TextInput
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Enter task description"
              multiline
              rows={3}
            />

            <Select
              label="Priority"
              value={priority}
              onChange={(value) => setPriority(value as Priority)}
              options={priorityOptions}
            />

            <LabelSelect
              label="Labels"
              selectedTags={tags}
              onChange={setTags}
              availableTags={mockTags}
            />

            <AssigneeSelect
              label="Assignees"
              selectedAssignees={assignees}
              onChange={setAssignees}
              availableUsers={mockUsers}
            />

            <DateInput label="Due Date" value={dueDate} onChange={setDueDate} />
          </div>

          <div className="px-6 pt-4 border-t border-slate-200 bg-white flex gap-3 flex-shrink-0 flex-col sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="w-full sm:flex-1"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
