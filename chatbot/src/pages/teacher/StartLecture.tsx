import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Mic, Copy, CheckCircle, Loader2, ArrowRight } from "lucide-react";

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Kannada", "Malayalam", "Marathi", "Gujarati", "Punjabi"];
const TOPICS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "History", "Geography", "Literature", "Economics", "General"];

export default function StartLecture() {
  const { user, updateSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", topic: "Mathematics", sourceLang: "English",
    targetLangs: [] as string[], autoSummary: true, liveQuiz: true,
  });
  const [result, setResult] = useState<{ roomCode: string; sessionId: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const toggleTargetLang = (lang: string) => {
    setForm(f => ({
      ...f,
      targetLangs: f.targetLangs.includes(lang)
        ? f.targetLangs.filter(l => l !== lang)
        : [...f.targetLangs, lang],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Lecture title is required"); return; }
    setError(""); setLoading(true);
    try {
      const data = await api.createSession(form, user!.token);
      setResult(data);
      updateSession(data.sessionId, data.roomCode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lecture Created!</h2>
          <p className="text-slate-500 mb-6">Share this room code with your students</p>
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <div className="text-4xl font-extrabold font-mono tracking-widest text-gray-900 mb-3">{result.roomCode}</div>
            <button onClick={copyCode} className="flex items-center gap-2 mx-auto bg-white border border-indigo-300 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all">
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
          <button
            onClick={() => navigate("/teacher/live")}
            className="w-full bg-[#111827] hover:bg-[#030712] text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2 transition-all"
          >
            Go to Live Control <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Mic size={24} /> Start a Lecture</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your session settings</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lecture Title *</label>
          <input
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Introduction to Calculus"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Subject</label>
            <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source Language</label>
            <select value={form.sourceLang} onChange={e => setForm({ ...form, sourceLang: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Target Translation Languages</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.filter(l => l !== form.sourceLang).map(lang => (
              <button
                key={lang} type="button"
                onClick={() => toggleTargetLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  form.targetLangs.includes(lang)
                    ? "bg-[#111827] text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                }`}
              >{lang}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {[
            { label: "Auto Summary", key: "autoSummary" },
            { label: "Live Quiz", key: "liveQuiz" },
          ].map(({ label, key }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${form[key as "autoSummary" | "liveQuiz"] ? "bg-[#111827]" : "bg-slate-300"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${form[key as "autoSummary" | "liveQuiz"] ? "left-5" : "left-1"}`} />
              </div>
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#111827] hover:bg-[#030712] text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Mic size={16} /> Create Lecture</>}
        </button>
      </form>
    </div>
  );
}
