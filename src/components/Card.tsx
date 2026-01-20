import { useDraggable } from "@dnd-kit/core";
import { IconEdit, IconCalendar, IconTrash } from "@tabler/icons-react";
import type { Card as CardType, Priority } from "../types";

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<Priority, { color: string; label: string; bg: string }> = {
  low: { color: 'text-slate-600', label: 'Low', bg: 'bg-slate-100' },
  medium: { color: 'text-blue-600', label: 'Medium', bg: 'bg-blue-100' },
  high: { color: 'text-orange-600', label: 'High', bg: 'bg-orange-100' },
  urgent: { color: 'text-red-600', label: 'Urgent', bg: 'bg-red-100' },
};

export function Card({ card, onEdit, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: { card },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group"
    >
      {/* Priority Badge & Edit/Delete Buttons */}
      <div className="flex items-center justify-between mb-2">
        {card.priority && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityConfig[card.priority].bg} ${priorityConfig[card.priority].color}`}>
            {priorityConfig[card.priority].label}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all md:opacity-0 md:group-hover:opacity-100"
            title="Edit task"
          >
            <IconEdit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all md:opacity-0 md:group-hover:opacity-100"
            title="Delete task"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
        {card.title}
      </h3>

      {/* Description */}
      {card.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{card.description}</p>
      )}

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-1 rounded-md font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer - Assignees & Due Date */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        {/* Assignees */}
        {card.assignees && card.assignees.length > 0 && (
          <div className="flex -space-x-2">
            {card.assignees.slice(0, 3).map((assignee) => (
              <img
                key={assignee.id}
                src={assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=random&size=32`}
                alt={assignee.name}
                title={assignee.name}
                className="w-7 h-7 rounded-full border-2 border-white"
              />
            ))}
            {card.assignees.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                +{card.assignees.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Due Date */}
        {card.dueDate && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <IconCalendar size={14} />
            <span>{new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
