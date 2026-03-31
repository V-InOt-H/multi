import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (roomCode: string, name: string, role: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      // Auto-rejoin if we have a room
      if (user.roomCode) {
        socket.emit("join_room", { roomCode: user.roomCode, name: user.name, role: user.role });
      }
    });

    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.id]);

  const joinRoom = (roomCode: string, name: string, role: string) => {
    socketRef.current?.emit("join_room", { roomCode, name, role });
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
