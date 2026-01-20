import { create } from "zustand";
import { api } from "../lib/api";
import type {
  BoardState,
  Card,
  Column,
  Priority,
  Tag,
  Assignee,
} from "../types";

interface BoardStore extends BoardState {
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;

  addCard: (
    columnId: string,
    title: string,
    description?: string,
    priority?: Priority,
    tags?: Tag[],
    assignees?: Assignee[],
    dueDate?: string,
  ) => void;
  updateCard: (
    id: string,
    title: string,
    description?: string,
    priority?: Priority,
    tags?: Tag[],
    assignees?: Assignee[],
    dueDate?: string,
  ) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, newColumnId: string, newOrder: number) => void;

  reorderCards: (columnId: string, cards: Card[]) => void;
  fetchTasks: () => Promise<void>;
}

const useBoardStore = create<BoardStore>((set) => ({
  columns: [
    { id: "todo", title: "To Do", order: 0, cards: [] },
    { id: "in-progress", title: "In Progress", order: 1, cards: [] },
    { id: "done", title: "Done", order: 2, cards: [] },
  ],
  cards: [],

  addColumn: (title) =>
    set((state) => {
      const newColumn: Column = {
        id: `column-${Date.now()}`,
        title,
        order: state.columns.length,
        cards: [],
      };
      return { columns: [...state.columns, newColumn] };
    }),

  updateColumn: (id, title) =>
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, title } : col,
      ),
    })),

  deleteColumn: (id) =>
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id),
      cards: state.cards.filter((card) => card.columnId !== id),
    })),

  addCard: async (
    columnId,
    title,
    description,
    priority,
    tags,
    assignees,
    dueDate,
  ) => {
    try {
      const columnCards = useBoardStore
        .getState()
        .cards.filter((c) => c.columnId === columnId);
      const newCard: Omit<Card, "id"> = {
        title,
        description,
        columnId,
        order: columnCards.length,
        priority,
        tags,
        assignees,
        dueDate,
      };

      const createdCard = await api.createTask(newCard);

      set((state) => ({
        cards: [...state.cards, { ...newCard, id: createdCard.id }],
      }));
    } catch (error) {
      console.error("❌ Failed to create card:", error);
      throw error;
    }
  },

  updateCard: async (
    id,
    title,
    description,
    priority,
    tags,
    assignees,
    dueDate,
  ) => {
    try {
      const updatedData: Partial<Card> = {
        title,
        description,
        priority,
        tags,
        assignees,
        dueDate,
      };

      await api.updateTask(id, updatedData);

      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id ? { ...card, ...updatedData } : card,
        ),
      }));
    } catch (error) {
      console.error("Failed to update card:", error);
      throw error;
    }
  },

  deleteCard: async (id) => {
    try {
      await api.deleteTask(id);
      set((state) => ({
        cards: state.cards.filter((card) => card.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete card:", error);
      throw error;
    }
  },

  moveCard: async (cardId, newColumnId, newOrder) => {
    try {
      // Optimistic update
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === cardId
            ? { ...card, columnId: newColumnId, order: newOrder }
            : card,
        ),
      }));

      // API call to persist the change
      await api.updateTask(cardId, {
        columnId: newColumnId,
        order: newOrder,
      });
    } catch (error) {
      console.error("❌ Failed to move card:", error);

      // Rollback - refetch from server
      await useBoardStore.getState().fetchTasks();
    }
  },

  reorderCards: async (columnId, cards) => {
    try {
      // API call to update order for all cards in the column
      await Promise.all(
        cards.map((card) => api.updateTask(card.id, { order: card.order })),
      );

      // Local state update after successful API call
      set((state) => {
        const otherCards = state.cards.filter((c) => c.columnId !== columnId);
        return { cards: [...otherCards, ...cards] };
      });
    } catch (error) {
      console.error("❌ Failed to reorder cards:", error);

      // Rollback - refetch from server
      await useBoardStore.getState().fetchTasks();
    }
  },

  fetchTasks: async () => {
    try {
      const tasks = await api.getTasks();

      set({ cards: tasks });
    } catch (error) {
      console.error("❌ Failed to fetch tasks:", error);
      throw error;
    }
  },
}));

export default useBoardStore;
