import { apiRequest } from "./queryClient";
import type { User, AuthResponse } from "@/types";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem("token", data.token);
    
    return data;
  },

  register: async (email: string, password: string, name: string, confirmPassword: string): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/register", { 
      email, 
      password, 
      name, 
      confirmPassword 
    });
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem("token", data.token);
    
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  getCurrentUser: async (): Promise<User> => {
    const token = authApi.getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();
    return data.user;
  },
};

export const isAuthenticated = (): boolean => {
  return !!authApi.getToken();
};
