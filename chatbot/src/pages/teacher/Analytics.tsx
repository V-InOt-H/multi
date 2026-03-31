import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart2, Users, TrendingUp } from "lucide-react";

const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const DEMO_ENGAGEMENT = Array.from({ length: 20 }, (_, i) => ({
  minute: i * 3, engagement: 70 + Math.random() * 25, confusion: Math.floor(Math.random() * 4),
}));

const DEMO_LANG_DIST = [
  { name: "Hindi", value: 35 }, { name: "Tamil", value: 20 }, { name: "English", value: 25 },
  { name: "Telugu", value: 10 }, { name: "Bengali", value: 10 },
];

const DEMO_STUDENTS = [
  { name: "Alice", attendance: 95, quizScore: 88, confusion: 2 },
  { name: "Bob", attendance: 80, quizScore: 72, confusion: 5 },
  { name: "Charlie", attendance: 100, quizScore: 94, confusion: 1 },
  { name: "Diana", attendance: 70, quizScore: 65, confusion: 8 },
  { name: "Eve", attendance: 90, quizScore: 81, confusion: 3 },
];

export default function Analytics() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<unknown[]>([]);

  useEffect(() => {
    if (user?.token) api.getSessions(user.token).then(setSessions).catch(console.error);
  }, [user?.token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BarChart2 size={24} /> Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Session performance and student engagement insights</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", value: sessions.length, icon: BarChart2 },
          { label: "Avg Engagement", value: "87%", icon: TrendingUp },
          { label: "Total Students", value: 24, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <Icon size={18} className="text-gray-400 mb-2" />
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Engagement line chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DEMO_ENGAGEMENT}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="minute" tick={{ fontSize: 11 }} label={{ value: "Minutes", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="engagement" stroke="#4F46E5" strokeWidth={2} dot={false} name="Engagement %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Confusion bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Confusion Events</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEMO_ENGAGEMENT}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="minute" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="confusion" fill="#F59E0B" name="Confusion Count" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Language distribution pie */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Student Language Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={DEMO_LANG_DIST} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {DEMO_LANG_DIST.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Per-student stats */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Student Stats</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FFF9E6] text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Attendance</th>
                  <th className="px-3 py-2 text-left">Quiz Score</th>
                  <th className="px-3 py-2 text-left">Confused</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_STUDENTS.map(s => (
                  <tr key={s.name} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.attendance}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{s.quizScore}%</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.confusion > 5 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{s.confusion}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
