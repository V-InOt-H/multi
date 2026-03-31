import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { GraduationCap, User, Mail, Hash, BookOpen, Lock, Loader2 } from "lucide-react";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate"];

export default function StudentRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    year: "",
    course: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await api.studentRegister({
        name: form.name,
        email: form.email,
        studentId: form.studentId,
        year: form.year,
        course: form.course,
        password: form.password,
      });
      login({ id: data.userId, role: "student", name: data.name, token: data.token });
      navigate("/auth/student-login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF9E6" }}>
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          ← Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-black/10 p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center mb-3">
              <GraduationCap size={22} className="text-gray-700" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Student Registration</h1>
            <p className="text-sm text-gray-500 mt-1">Create your account to join lecture sessions</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text" value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="John Doe" required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="john.doe@university.edu" required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Student ID</label>
                <input
                  type="text" value={form.studentId} onChange={e => set("studentId", e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="STU001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Year</label>
                <select
                  value={form.year} onChange={e => set("year", e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Select</option>
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Course</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text" value={form.course} onChange={e => set("course", e.target.value)}
                  className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Computer Science"
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

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                  className="w-full border border-black/10 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-[#FFFAF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="••••••••" required
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/auth/student-login" className="text-gray-900 font-medium hover:underline">
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
