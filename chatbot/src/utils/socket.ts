import { io, Socket } from "socket.io-client";

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(import.meta.env.VITE_SOCKET_URL || "", {
      path: "/socket.io",
      autoConnect: false,
    });
  }
  return _socket;
}

export function connectSocket(): Socket {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectSocket() {
  _socket?.disconnect();
  _socket = null;
}
