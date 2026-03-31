import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRole: "teacher" | "student";
  children: ReactNode;
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== allowedRole) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
