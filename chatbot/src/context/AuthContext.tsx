import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  role: "teacher" | "student";
  name: string;
  email?: string;
  token: string;
  roomCode?: string;
  sessionId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateSession: (sessionId: string, roomCode: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("lecture_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData: User) => {
    localStorage.setItem("lecture_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("lecture_user");
    setUser(null);
  };

  const updateSession = (sessionId: string, roomCode: string) => {
    if (!user) return;
    const updated = { ...user, sessionId, roomCode };
    localStorage.setItem("lecture_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
