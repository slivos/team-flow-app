import type { Card, UserProfile } from "../types";

const API_BASE_URL = "https://696e31a4d7bacd2dd71613c3.mockapi.io/api/v1";

// API client - len čisté HTTP volania
export const api = {
  // GET - načítanie všetkých taskov
  getTasks: async (): Promise<Card[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  },

  // GET - načítanie tasku podľa ID
  getTask: async (id: string): Promise<Card> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) throw new Error("Failed to fetch task");
    return response.json();
  },

  // POST - vytvorenie nového tasku
  createTask: async (data: Omit<Card, "id" | "order">): Promise<Card> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  },

  // PUT - úprava existujúceho tasku
  updateTask: async (id: string, data: Partial<Card>): Promise<Card> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update task");
    return response.json();
  },

  // DELETE - zmazanie tasku
  deleteTask: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete task");
  },

  // GET - načítanie user profile
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user profile");
    return response.json();
  },

  // PUT - update user profile
  updateUserProfile: async (
    userId: string,
    data: Partial<UserProfile>,
  ): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update user profile");
    return response.json();
  },
};
