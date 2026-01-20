import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useState, useEffect, useMemo } from "react";
import useBoardStore from "../store/boardStore";
import { Column } from "./Column";
import { Card } from "./Card";
import { EditTaskModal } from "./EditTaskModal";
import { DeleteTaskModal } from "./DeleteTaskModal";
import type { Card as CardType, Priority } from "../types";
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from "@tabler/icons-react";
import { TextInput } from "./ui/TextInput";
import { Select } from "./ui/Select";

export function Board() {
  const { columns, cards, moveCard, reorderCards, fetchTasks, deleteCard } =
    useBoardStore();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardType | null>(null);

  // Filter, Search & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [sortBy, setSortBy] = useState<"order" | "title" | "dueDate">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filtered and sorted cards
  const filteredAndSortedCards = useMemo(() => {
    let result = [...cards];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (card) =>
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      result = result.filter((card) => card.priority === priorityFilter);
    }

    // Sort cards
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else
            comparison =
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "order":
        default:
          comparison = a.order - b.order;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [cards, searchQuery, priorityFilter, sortBy, sortOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    // Check if overId is a column or a card
    const isOverColumn = columns.some((col) => col.id === overId);

    let targetColumnId: string;
    if (isOverColumn) {
      targetColumnId = overId;
    } else {
      const overCard = cards.find((c) => c.id === overId);
      if (!overCard) return;
      targetColumnId = overCard.columnId;
    }

    if (card.columnId === targetColumnId) {
      // Reorder within same column
      if (isOverColumn) return; // Can't reorder when dropping on empty column space

      const columnCards = cards
        .filter((c) => c.columnId === targetColumnId)
        .sort((a, b) => a.order - b.order);

      const oldIndex = columnCards.findIndex((c) => c.id === cardId);
      const newIndex = columnCards.findIndex((c) => c.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reorderedCards = arrayMove(columnCards, oldIndex, newIndex).map(
        (c, index) => ({
          ...c,
          order: index,
        }),
      );

      reorderCards(targetColumnId, reorderedCards);
    } else {
      // Move to different column
      const targetColumnCards = cards.filter(
        (c) => c.columnId === targetColumnId,
      );
      const newOrder = targetColumnCards.length;

      moveCard(cardId, targetColumnId, newOrder);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setDeletingCard(card);
    }
  };

  const confirmDelete = () => {
    if (deletingCard) {
      deleteCard(deletingCard.id);
      setDeletingCard(null);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Filter & Sort Controls */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[150px] sm:min-w-[200px] max-w-md">
            <TextInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks..."
              leadingIcon={<IconSearch className="text-slate-400" size={18} />}
            />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="sm:hidden flex items-center gap-2 px-4 h-[42px] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <IconFilter size={18} className="text-slate-500" />
            <span className="text-sm font-medium">Filters</span>
          </button>

          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <Select
                value={priorityFilter}
                onChange={(value) =>
                  setPriorityFilter(value as Priority | "all")
                }
                options={[
                  { value: "all", label: "All Priorities" },
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onChange={(value) =>
                  setSortBy(value as "order" | "title" | "dueDate")
                }
                options={[
                  { value: "order", label: "Sort by Order" },
                  { value: "title", label: "Sort by Title" },
                  { value: "dueDate", label: "Sort by Due Date" },
                ]}
              />

              {/* Sort Order Toggle */}
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="w-[42px] h-[42px] flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? (
                  <IconSortAscending size={18} className="text-slate-600" />
                ) : (
                  <IconSortDescending size={18} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 sm:hidden transition-opacity duration-300 ${
            isFilterDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsFilterDrawerOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`fixed inset-y-0 right-0 w-80 bg-white z-50 shadow-xl sm:hidden flex flex-col transition-transform duration-300 ease-out ${
            isFilterDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Filters & Sort
            </h2>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <IconX size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Priority Filter */}
            <div>
              <Select
                label="Priority"
                value={priorityFilter}
                onChange={(value) =>
                  setPriorityFilter(value as Priority | "all")
                }
                options={[
                  { value: "all", label: "All Priorities" },
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </div>

            {/* Sort By */}
            <div>
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(value) =>
                  setSortBy(value as "order" | "title" | "dueDate")
                }
                options={[
                  { value: "order", label: "Order" },
                  { value: "title", label: "Title" },
                  { value: "dueDate", label: "Due Date" },
                ]}
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort Order
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder("asc")}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    sortOrder === "asc"
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Ascending
                </button>
                <button
                  onClick={() => setSortOrder("desc")}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    sortOrder === "desc"
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Descending
                </button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(priorityFilter !== "all" ||
              sortBy !== "order" ||
              sortOrder !== "asc") && (
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setPriorityFilter("all");
                    setSortBy("order");
                    setSortOrder("asc");
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full px-4 py-3 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </>

      <div className="flex flex-col sm:flex-row gap-5 p-6 px-4 sm:p-8 overflow-x-auto">
        {columns.map((column) => {
          const columnCards = filteredAndSortedCards.filter(
            (c) => c.columnId === column.id,
          );
          return (
            <div key={column.id} className="w-full sm:w-auto">
              <Column
                column={column}
                cards={columnCards}
                onEditCard={setEditingCard}
                onDeleteCard={handleDeleteCard}
              />
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeCard ? (
          <Card card={activeCard} onEdit={() => {}} onDelete={() => {}} />
        ) : null}
      </DragOverlay>

      {editingCard && (
        <EditTaskModal
          card={editingCard}
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}

      {deletingCard && (
        <DeleteTaskModal
          isOpen={!!deletingCard}
          onClose={() => setDeletingCard(null)}
          onConfirm={confirmDelete}
          taskTitle={deletingCard.title}
        />
      )}
    </DndContext>
  );
}
