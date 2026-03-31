import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { Users, TrendingUp, AlertTriangle, Clock, PlusCircle, Radio } from "lucide-react";

interface Session {
  sessionId: string; roomCode: string; title: string; topic: string;
  startTime: string; isActive: boolean; attendance: unknown[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    api.getSessions(user.token)
      .then(data => setSessions(data as Session[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.token]);

  const activeSession = sessions.find(s => s.isActive);
  const recentSessions = sessions.filter(s => !s.isActive).slice(0, 5);
  const totalStudents = sessions.reduce((acc, s) => acc + (s.attendance?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={() => navigate("/teacher/start")}
          className="flex items-center gap-2 bg-[#111827] hover:bg-[#030712] text-white px-4 py-2 rounded-lg font-medium transition-all"
        >
          <PlusCircle size={18} /> New Lecture
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: sessions.length, icon: Clock, color: "indigo" },
          { label: "Active Now", value: activeSession ? 1 : 0, icon: Radio, color: activeSession ? "green" : "slate" },
          { label: "Total Students", value: totalStudents, icon: Users, color: "cyan" },
          { label: "Avg Engagement", value: "87%", icon: TrendingUp, color: "amber" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-black/10 p-4 shadow-sm">
            <div className={`text-${color}-500 mb-2`}><Icon size={20} /></div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Active session panel */}
        <div className="bg-white rounded-xl border border-black/10 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Radio size={16} className="text-green-500" /> Live Session
          </h2>
          {activeSession ? (
            <div>
              <div className="text-lg font-bold text-slate-900">{activeSession.title}</div>
              <div className="text-sm text-slate-500 mb-3">{activeSession.topic}</div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono bg-gray-100 text-gray-900 px-3 py-1 rounded-lg font-bold text-lg">{activeSession.roomCode}</span>
                <span className="text-xs text-slate-400">Room Code</span>
              </div>
              <button
                onClick={() => { navigate("/teacher/live"); }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Radio size={14} /> Go to Live Control
              </button>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">
              No active session.
              <button onClick={() => navigate("/teacher/start")} className="ml-2 text-gray-900 hover:underline font-medium">
                Start a lecture →
              </button>
            </div>
          )}
        </div>

        {/* Confusion alerts placeholder */}
        <div className="bg-white rounded-xl border border-black/10 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Confusion Alerts
          </h2>
          <div className="text-slate-400 text-sm">Confusion alerts will appear here during live sessions.</div>
        </div>
      </div>

      {/* Recent sessions table */}
      <div className="bg-white rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Sessions</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : recentSessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No past sessions yet. Start your first lecture!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FFF9E6] text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Topic</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">Students</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map(s => (
                  <tr key={s.sessionId} className="border-t border-slate-100 hover:bg-[#FFF9E6] cursor-pointer" onClick={() => navigate("/teacher/summary")}>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.title}</td>
                    <td className="px-4 py-3 text-slate-500">{s.topic}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(s.startTime).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{s.roomCode}</td>
                    <td className="px-4 py-3 text-slate-500">{s.attendance?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
