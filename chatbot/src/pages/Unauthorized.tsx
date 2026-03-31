import { useNavigate } from "react-router";
import { ShieldOff } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <ShieldOff className="text-red-400 mx-auto mb-4" size={48} />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You don't have permission to view this page.</p>
        <button onClick={() => navigate("/")} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Go Home
        </button>
      </div>
    </div>
  );
}
