import { useState, useEffect, useMemo } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Users, Calendar, Download, TrendingUp, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
  sessionId: string;
  title: string;
  date: string;
  month: string;
  attendees: string[];
}

export default function AttendanceTracker() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ report: AttendanceRecord[], studentNames: string[] }>({ report: [], studentNames: [] });
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const result = await api.get<any>("/api/attendance", user.token);
      setData(result);
      if (result.report.length > 0) {
          const latestMonth = result.report[result.report.length - 1].month;
          setSelectedMonth(latestMonth);
      }
    } catch (err) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const months = useMemo(() => {
    return [...new Set(data.report.map(r => r.month))];
  }, [data.report]);

  const filteredReport = useMemo(() => {
    return data.report.filter(r => r.month === selectedMonth);
  }, [selectedMonth, data.report]);

  const studentStats = useMemo(() => {
    const stats: Record<string, { present: number, total: number }> = {};
    const monthSessions = filteredReport;
    
    data.studentNames.forEach(name => {
      stats[name] = { present: 0, total: monthSessions.length };
    });

    monthSessions.forEach(session => {
      session.attendees.forEach(name => {
        if (stats[name]) stats[name].present += 1;
      });
    });

    return stats;
  }, [filteredReport, data.studentNames]);

  const exportCSV = () => {
    if (filteredReport.length === 0) return toast.info("No data to export");
    
    const headers = ["Student Name", "Total Sessions", "Present", "Percentage (%)"];
    const rows = data.studentNames.map(name => {
      const s = studentStats[name];
      const percentage = s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : "0.0";
      return [name, s.total, s.present, percentage];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${selectedMonth.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully!");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
          <p className="text-gray-500 text-sm">Monitor student participation across your sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none shadow-sm"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button 
            onClick={exportCSV}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Calendar size={20} />
             </div>
             <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{filteredReport.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Users size={20} />
             </div>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Unique Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{data.studentNames.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <TrendingUp size={20} />
             </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Avg. Attendance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {filteredReport.length > 0 
                ? (Object.values(studentStats).reduce((acc, s) => acc + (s.present / s.total), 0) / data.studentNames.length * 100).toFixed(0) 
                : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-gray-900">Student Participation List</h2>
          <div className="relative">
             <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
             <input type="text" placeholder="Search student..." className="pl-9 pr-4 py-1.5 bg-white border border-black/5 rounded-lg text-xs focus:ring-2 focus:ring-amber-400 outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FFFAF0] text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Sessions (Month)</th>
                <th className="px-6 py-3">Present</th>
                <th className="px-6 py-3">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.studentNames.map(name => {
                const s = studentStats[name];
                const perc = s.total > 0 ? (s.present / s.total) * 100 : 0;
                return (
                  <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {name[0]}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${perc > 75 ? "bg-green-100 text-green-700" : perc > 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {perc > 75 ? "Excellent" : perc > 40 ? "Regular" : "Low"}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.total}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.present}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                                <div className={`h-full rounded-full ${perc > 75 ? "bg-green-500" : perc > 40 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${perc}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{perc.toFixed(0)}%</span>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
