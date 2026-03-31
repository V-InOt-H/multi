import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Hash, User, Loader2, LogIn } from "lucide-react";

export default function JoinSession() {
  const { user, updateSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", roomCode: user?.roomCode || "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.roomCode.length !== 6) { setError("Room code must be 6 characters"); return; }
    setLoading(true);
    try {
      const session = await api.joinSession(form.roomCode.toUpperCase(), form.name);
      updateSession(session.sessionId, form.roomCode.toUpperCase());
      navigate("/student/lecture");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Room not found or lecture not started");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-8 w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2"><LogIn size={20} /> Join Session</h1>
        <p className="text-slate-500 text-sm mb-5">Enter a room code to join a live lecture</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Your display name" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room Code</label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" value={form.roomCode}
                onChange={e => setForm({ ...form, roomCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) })}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="XK9P2M" required maxLength={6} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 font-medium flex items-center justify-center gap-2 disabled:opacity-70">
            {loading && <Loader2 size={16} className="animate-spin" />} Join Lecture
          </button>
        </form>
      </div>
    </div>
  );
}
