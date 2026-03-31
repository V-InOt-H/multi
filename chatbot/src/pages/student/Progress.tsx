import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Download, Calendar } from "lucide-react";

const DEMO_SCORES = [
  { session: "Lecture 1", score: 85 }, { session: "Lecture 2", score: 72 },
  { session: "Lecture 3", score: 91 }, { session: "Lecture 4", score: 68 },
  { session: "Lecture 5", score: 88 },
];

const DEMO_ATTENDANCE = [
  { date: "Mon", present: true }, { date: "Tue", present: true }, { date: "Wed", present: false },
  { date: "Thu", present: true }, { date: "Fri", present: true }, { date: "Mon", present: true },
  { date: "Tue", present: false }, { date: "Wed", present: true }, { date: "Thu", present: true },
  { date: "Fri", present: true },
];

export default function Progress() {
  const { user } = useAuth();
  const attended = DEMO_ATTENDANCE.filter(d => d.present).length;
  const attendPct = Math.round((attended / DEMO_ATTENDANCE.length) * 100);
  const avgScore = Math.round(DEMO_SCORES.reduce((a, b) => a + b.score, 0) / DEMO_SCORES.length);

  const downloadReport = () => {
    const content = `PROGRESS REPORT\nStudent: ${user?.name}\n\nAttendance: ${attendPct}%\nAvg Quiz Score: ${avgScore}%\n\nQuiz Scores:\n${DEMO_SCORES.map(s => `${s.session}: ${s.score}%`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "progress-report.txt"; a.click();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={24} /> My Progress</h1>
        <button onClick={downloadReport} className="flex items-center gap-1.5 text-sm border border-slate-300 rounded-lg px-3 py-2 hover:bg-[#FFF9E6]">
          <Download size={14} /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Attendance", value: `${attendPct}%`, color: "green" },
          { label: "Avg Quiz Score", value: `${avgScore}%`, color: "indigo" },
          { label: "Engagement Score", value: "92%", color: "cyan" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className={`text-2xl font-extrabold text-${color}-600`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quiz scores chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Quiz Scores</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DEMO_SCORES}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="session" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Score %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance heatmap */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={16} /> Attendance</h2>
        <div className="flex flex-wrap gap-2">
          {DEMO_ATTENDANCE.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-lg ${d.present ? "bg-green-500" : "bg-red-200"} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{d.present ? "✓" : "✗"}</span>
              </div>
              <span className="text-xs text-slate-400">{d.date}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-3">Present: {attended}/{DEMO_ATTENDANCE.length} sessions ({attendPct}%)</p>
      </div>
    </div>
  );
}
