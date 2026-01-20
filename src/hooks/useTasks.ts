import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Card, Priority, Tag, Assignee } from "../types";

// Query keys pre invalidáciu cache
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// GET - načítanie všetkých taskov
export function useTasks() {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: api.getTasks,
  });
}

// GET - načítanie jedného tasku
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => api.getTask(id),
    enabled: !!id, // len ak je ID definované
  });
}

// POST - vytvorenie tasku
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      columnId: string;
      priority?: Priority;
      tags?: Tag[];
      assignees?: Assignee[];
      dueDate?: string;
    }) => api.createTask(data),

    // Optimistic update - optional
    onMutate: async (newTask) => {
      // Zrušenie prichádzajúcich refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // Snapshot predchádzajúceho stavu
      const previousTasks = queryClient.getQueryData(taskKeys.lists());

      // Optimistic update
      queryClient.setQueryData(taskKeys.lists(), (old: Card[] = []) => [
        ...old,
        {
          ...newTask,
          id: `temp-${Date.now()}`,
          order: old.length,
        } as Card,
      ]);

      return { previousTasks };
    },

    // Revert pri chybe
    onError: (err, variables, context) => {
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks);
    },

    // Refetch po úspechu
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// PUT - úprava tasku
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Card> }) =>
      api.updateTask(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      const previousTasks = queryClient.getQueryData(taskKeys.lists());
      const previousTask = queryClient.getQueryData(taskKeys.detail(id));

      // Optimistic update v zozname
      queryClient.setQueryData(taskKeys.lists(), (old: Card[] = []) =>
        old.map((task) => (task.id === id ? { ...task, ...data } : task))
      );

      // Optimistic update detailu
      queryClient.setQueryData(taskKeys.detail(id), (old: Card | undefined) =>
        old ? { ...old, ...data } : old
      );

      return { previousTasks, previousTask };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks);
      queryClient.setQueryData(taskKeys.detail(variables.id), context?.previousTask);
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
    },
  });
}

// DELETE - zmazanie tasku
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousTasks = queryClient.getQueryData(taskKeys.lists());

      // Optimistic update - odstránenie tasku
      queryClient.setQueryData(taskKeys.lists(), (old: Card[] = []) =>
        old.filter((task) => task.id !== id)
      );

      return { previousTasks };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(taskKeys.lists(), context?.previousTasks);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Spôsob použitia v komponente:
// const { data: tasks, isLoading, error } = useTasks();
// const createTask = useCreateTask();
// const updateTask = useUpdateTask();
// const deleteTask = useDeleteTask();
//
// createTask.mutate({ title: "Nový task", columnId: "todo" });
// updateTask.mutate({ id: "123", data: { title: "Updated" } });
// deleteTask.mutate("123");
