import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { IconPlus } from "@tabler/icons-react";
import type { Column as ColumnType, Card as CardType } from "../types";
import { SortableCard } from "./SortableCard";
import { AddTaskModal } from "./AddTaskModal";

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string) => void;
}

const getColumnColor = (columnId: string) => {
  const colors: Record<string, { bg: string; dot: string; text: string }> = {
    'todo': { bg: 'bg-gradient-to-br from-slate-50 to-slate-100', dot: 'bg-slate-400', text: 'text-slate-700' },
    'in-progress': { bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', dot: 'bg-blue-500', text: 'text-blue-700' },
    'done': { bg: 'bg-gradient-to-br from-green-50 to-emerald-50', dot: 'bg-green-500', text: 'text-green-700' },
  };
  return colors[columnId] || colors['todo'];
};

export function Column({ column, cards, onEditCard, onDeleteCard }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { column },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedCards = [...cards].sort((a, b) => a.order - b.order);
  const colors = getColumnColor(column.id);

  return (
    <div className="shrink-0 w-full sm:w-80">
      <div className={`${colors.bg} rounded-2xl p-4 shadow-sm border border-slate-200/50`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <h2 className={`font-bold ${colors.text}`}>{column.title}</h2>
          </div>
          <span className="bg-white/80 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {cards.length}
          </span>
        </div>

        <SortableContext
          items={sortedCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
            {sortedCards.map((card) => (
              <SortableCard key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
            ))}
          </div>
        </SortableContext>

        {/* Add Card Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-3 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
        >
          <IconPlus size={16} />
          Add Task
        </button>
      </div>

      <AddTaskModal
        columnId={column.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
