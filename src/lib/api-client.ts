const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("smartlife_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  authMethod: "email" | "phone" | "google";
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string, phone?: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, phone }),
      }),
  },

  shopping: {
    list: () => request<any[]>("/shopping"),
    create: (data: any) =>
      request<any>("/shopping", { method: "POST", body: JSON.stringify(data) }),
    update: (data: any) =>
      request<any>("/shopping", { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>("/shopping?id=" + id, { method: "DELETE" }),
  },

  budget: {
    list: () => request<any[]>("/budget"),
    create: (data: any) =>
      request<any>("/budget", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>("/budget?id=" + id, { method: "DELETE" }),
  },

  recipes: {
    list: () => request<any[]>("/recipes"),
    create: (data: any) =>
      request<any>("/recipes", { method: "POST", body: JSON.stringify(data) }),
    update: (data: any) =>
      request<any>("/recipes", { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>("/recipes?id=" + id, { method: "DELETE" }),
  },

  weekly: {
    list: () => request<any[]>("/weekly"),
    create: (data: any) =>
      request<any>("/weekly", { method: "POST", body: JSON.stringify(data) }),
    update: (data: any) =>
      request<any>("/weekly", { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>("/weekly?id=" + id, { method: "DELETE" }),
  },

  monthly: {
    list: () => request<any[]>("/monthly"),
    create: (data: any) =>
      request<any>("/monthly", { method: "POST", body: JSON.stringify(data) }),
    update: (data: any) =>
      request<any>("/monthly", { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>("/monthly?id=" + id, { method: "DELETE" }),
  },

  yearly: {
    list: () => request<any[]>("/yearly"),
    create: (data: any) =>
      request<any>("/yearly", { method: "POST", body: JSON.stringify(data) }),
    update: (data: any) =>
      request<any>("/yearly", { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<any>("/yearly?id=" + id, { method: "DELETE" }),
  },
};
