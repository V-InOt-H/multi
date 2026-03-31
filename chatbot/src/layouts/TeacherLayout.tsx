import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { BookOpen, BarChart2, Mic, FileText, LayoutDashboard, LogOut, Radio } from "lucide-react";

import { Users as UsersIcon } from "lucide-react";

const navLinks = [
  { label: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "Start Lecture", path: "/teacher/start", icon: Mic },
  { label: "Live Control", path: "/teacher/live", icon: Radio },
  { label: "Analytics", path: "/teacher/analytics", icon: BarChart2 },
  { label: "Summary", path: "/teacher/summary", icon: FileText },
  { label: "Video Link", path: "/teacher/video", icon: Radio },
  { label: "Attendance", path: "/teacher/attendance", icon: UsersIcon },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FFF9E6] flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <BookOpen className="text-gray-900" size={24} />
          <span className="font-bold text-lg text-slate-800">EduSense</span>
          <span className="text-xs bg-amber-100 text-gray-900 px-2 py-0.5 rounded-full font-medium ml-1">Teacher</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-gray-100 text-gray-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 hidden sm:block">{user?.name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>
      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto bg-white border-b border-slate-200 px-2">
        {navLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? "text-gray-900 border-b-2 border-gray-900" : "text-slate-500"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
