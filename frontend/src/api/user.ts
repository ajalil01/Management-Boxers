import { API_BASE_URL } from "./config";

export interface User {
  id: string;
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.success) return null;

    return data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
