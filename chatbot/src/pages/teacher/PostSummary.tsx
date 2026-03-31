import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { FileText, Download, ChevronDown, ChevronUp, Send, Loader2, BookOpen, CheckSquare } from "lucide-react";
import { toast } from "sonner";

interface Chapter { title: string; startMinute: number; description: string; }
interface ActionItem { text: string; assignedTo: string; timestamp?: string; }
interface TranscriptEntry { text: string; timestamp: number; }

export default function PostSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user?.sessionId || !user?.token) return;
    setLoading(true);
    api.getSummary(user.sessionId, user.token)
      .then(data => {
        setSummary(data.summary || "");
        setChapters(data.chapters as Chapter[] || []);
        setActionItems(data.actionItems as ActionItem[] || []);
        setTranscript(data.transcript as TranscriptEntry[] || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.sessionId, user?.token]);

  const handleGenerate = async () => {
    if (!user?.sessionId) { toast.error("No active session"); return; }
    setGenerating(true);
    try {
      const data = await api.generateSummary(user.sessionId, user.token);
      setSummary(data.summary || "");
      setChapters(data.chapters as Chapter[] || []);
      setActionItems(data.actionItems as ActionItem[] || []);
      toast.success("Summary generated!");
    } catch { toast.error("Failed to generate summary. Add OPENAI_API_KEY for AI summaries."); }
    finally { setGenerating(false); }
  };

  const downloadTxt = () => {
    const content = `LECTURE SUMMARY\n\n${summary}\n\nCHAPTERS:\n${chapters.map(c => `- ${c.title}: ${c.description}`).join("\n")}\n\nACTION ITEMS:\n${actionItems.map(a => `- ${a.text} (${a.assignedTo || "unassigned"})`).join("\n")}\n\nTRANSCRIPT:\n${transcript.map(t => t.text).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "lecture-summary.txt"; a.click();
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ summary, chapters, actionItems, transcript }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "lecture-data.json"; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading summary...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText size={24} /> Post-Lecture Summary</h1>
          <p className="text-slate-500 text-sm mt-1">AI-generated summary, chapters, and action items</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTxt} className="flex items-center gap-1.5 text-sm border border-slate-300 rounded-lg px-3 py-2 hover:bg-[#FFF9E6] transition-all">
            <Download size={14} /> TXT
          </button>
          <button onClick={downloadJson} className="flex items-center gap-1.5 text-sm border border-slate-300 rounded-lg px-3 py-2 hover:bg-[#FFF9E6] transition-all">
            <Download size={14} /> JSON
          </button>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-1.5 text-sm bg-[#111827] hover:bg-[#030712] text-white rounded-lg px-3 py-2 transition-all disabled:opacity-60">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {generating ? "Generating..." : "Generate AI Summary"}
          </button>
        </div>
      </div>

      {!summary && !generating && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          No summary yet. Start a lecture and record audio, then click "Generate AI Summary". 
          Set <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> for AI-powered summaries.
        </div>
      )}

      {summary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={16} /> Summary</h2>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
          <button className="mt-3 flex items-center gap-1.5 text-sm text-gray-900 hover:underline">
            <Send size={14} /> Send to Students
          </button>
        </div>
      )}

      {chapters.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Smart Chapters</h2>
          <div className="space-y-3">
            {chapters.map((c, i) => (
              <div key={i} className="flex gap-3 p-3 bg-[#FFF9E6] rounded-lg">
                <div className="text-xs font-mono text-slate-400 mt-0.5 w-12 flex-shrink-0">{c.startMinute}min</div>
                <div>
                  <div className="font-medium text-slate-800">{c.title}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{c.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckSquare size={16} /> Action Items</h2>
          <div className="space-y-2">
            {actionItems.map((a, i) => (
              <div key={i} className="flex items-start gap-2 p-2">
                <CheckSquare size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-slate-700">{a.text}</span>
                  {a.assignedTo && <span className="text-xs text-slate-400 ml-2">→ {a.assignedTo}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {transcript.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setTranscriptOpen(!transcriptOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[#FFF9E6] transition-all"
          >
            <span className="font-semibold text-slate-800">Full Transcript ({transcript.length} entries)</span>
            {transcriptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {transcriptOpen && (
            <div className="border-t border-slate-100 p-4 max-h-80 overflow-y-auto space-y-2">
              {transcript.map((t, i) => (
                <div key={i} className="text-sm text-slate-700">
                  <span className="text-xs text-slate-400 mr-2">{new Date(t.timestamp).toLocaleTimeString()}</span>
                  {t.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Zap({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
}
