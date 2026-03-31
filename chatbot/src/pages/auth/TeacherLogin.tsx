import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { GraduationCap, Mail, Lock, User, Loader2 } from "lucide-react";

export default function TeacherLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await api.teacherLogin(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError("Name is required"); setLoading(false); return; }
        data = await api.teacherRegister(form.email, form.password, form.name);
      }
      login({ id: data.userId, role: "teacher", name: data.name, email: form.email, token: data.token });
      navigate("/teacher/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
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
            <h1 className="text-2xl font-semibold text-gray-900">Teacher Portal</h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "login" ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-black/10 mb-5 overflow-hidden">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text" value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Dr. Jane Smith" required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="teacher@school.edu" required
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
                  placeholder="••••••••" required minLength={6}
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {mode === "login" && (
            <p className="mt-4 text-center text-xs text-gray-400">
              Demo: teacher@demo.com / demo1234
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
