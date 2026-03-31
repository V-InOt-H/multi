import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { GraduationCap, Hash, User, Mail, Lock, Loader2 } from "lucide-react";

type Mode = "join" | "signin";

export default function StudentLogin() {
  const { login, updateSession } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("join");
  const [form, setForm] = useState({ name: "", roomCode: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.roomCode.length !== 6) { setError("Room code must be 6 characters"); return; }
    setLoading(true);
    try {
      const sessionInfo = await api.joinSession(form.roomCode.toUpperCase(), form.name);
      const authData = await api.studentLogin(form.name, form.roomCode.toUpperCase());
      login({ id: authData.userId, role: "student", name: form.name, token: authData.token, roomCode: form.roomCode.toUpperCase() });
      updateSession(sessionInfo.sessionId, form.roomCode.toUpperCase());
      navigate("/student/lecture");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.studentLoginEmail(form.email, form.password);
      login({ id: data.userId, role: "student", name: data.name, token: data.token });
      navigate("/student/lecture");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF9E6" }}>
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          ← Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-black/10 p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center mb-3">
              <GraduationCap size={22} className="text-gray-700" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Student Portal</h1>
            <p className="text-sm text-gray-500 mt-1">Join a lecture or sign in to your account</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-black/10 mb-5 overflow-hidden">
            <button
              onClick={() => { setMode("join"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "join" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Join with Room Code
            </button>
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "signin" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}

          {mode === "join" ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text" value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Your display name" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Room Code</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text" value={form.roomCode}
                    onChange={e => set("roomCode", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                    className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono uppercase tracking-widest bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="XK9P2M" required maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">6-character code from your teacher</p>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Join Lecture
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="you@university.edu" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="password" value={form.password} onChange={e => set("password", e.target.value)}
                    className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••••••" required
                  />
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          <div className="mt-5 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/auth/student-register" className="text-gray-900 font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
