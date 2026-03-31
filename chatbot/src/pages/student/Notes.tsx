import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { BookMarked, Download, Edit3, Save } from "lucide-react";

interface Chapter { title: string; startMinute: number; description: string; }

export default function Notes() {
  const { user } = useAuth();
  const [summary, setSummary] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [personalNotes, setPersonalNotes] = useState(() => localStorage.getItem("student_notes_" + (user?.id || "")) || "");
  const [editingNotes, setEditingNotes] = useState(false);

  useEffect(() => {
    if (!user?.sessionId || !user?.token) return;
    api.getSummary(user.sessionId, user.token)
      .then(data => {
        setSummary(data.summary || "");
        setChapters(data.chapters as Chapter[] || []);
      })
      .catch(console.error);
  }, [user?.sessionId, user?.token]);

  const saveNotes = () => {
    localStorage.setItem("student_notes_" + (user?.id || ""), personalNotes);
    setEditingNotes(false);
  };

  const downloadNotes = () => {
    const content = `MY LECTURE NOTES\n\n${personalNotes}\n\n---\nAI SUMMARY:\n${summary}\n\nCHAPTERS:\n${chapters.map(c => `• ${c.title}: ${c.description}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "my-notes.txt"; a.click();
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BookMarked size={24} /> Notes</h1>
        <button onClick={downloadNotes} className="flex items-center gap-1.5 text-sm border border-slate-300 rounded-lg px-3 py-2 hover:bg-[#FFF9E6]">
          <Download size={14} /> Download
        </button>
      </div>

      {summary ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">AI Summary</h2>
          <p className="text-slate-700 leading-relaxed text-sm">{summary}</p>
        </div>
      ) : (
        <div className="bg-[#FFF9E6] rounded-xl border border-slate-200 p-5 text-sm text-slate-400 text-center">
          AI summary will appear here after your teacher pushes it
        </div>
      )}

      {chapters.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Smart Chapters</h2>
          <div className="space-y-2">
            {chapters.map((c, i) => (
              <div key={i} className="flex gap-3 p-2 hover:bg-[#FFF9E6] rounded-lg cursor-pointer group">
                <span className="text-xs font-mono text-slate-400 mt-0.5 w-10 flex-shrink-0">{c.startMinute}m</span>
                <div>
                  <span className="text-sm font-medium text-slate-800 group-hover:text-gray-900">{c.title}</span>
                  <p className="text-xs text-slate-500">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal notes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Edit3 size={16} /> My Personal Notes</h2>
          {editingNotes ? (
            <button onClick={saveNotes} className="flex items-center gap-1.5 text-sm bg-[#111827] text-white rounded-lg px-3 py-1.5 hover:bg-black">
              <Save size={14} /> Save
            </button>
          ) : (
            <button onClick={() => setEditingNotes(true)} className="flex items-center gap-1.5 text-sm border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-[#FFF9E6]">
              <Edit3 size={14} /> Edit
            </button>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={personalNotes} onChange={e => setPersonalNotes(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 h-40 resize-none"
            placeholder="Type your personal notes here..."
          />
        ) : (
          <div className="text-sm text-slate-700 whitespace-pre-wrap min-h-[60px] leading-relaxed">
            {personalNotes || <span className="text-slate-400">No personal notes yet. Click Edit to start.</span>}
          </div>
        )}
      </div>
    </div>
  );
}
