import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Video, BookMarked, HelpCircle, TrendingUp, LogOut, Radio } from "lucide-react";
import StreakDisplay from "../app/components/StreakDisplay";

const navLinks = [
  { label: "Lecture", path: "/student/lecture", icon: Video },
  { label: "Notes", path: "/student/notes", icon: BookMarked },
  { label: "Quiz", path: "/student/quiz", icon: HelpCircle },
  { label: "Progress", path: "/student/progress", icon: TrendingUp },
  { label: "Video Link", path: "/student/video", icon: Radio },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FFF9E6] flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <BookOpen className="text-gray-900" size={24} />
          <span className="font-bold text-lg text-slate-800">EduSense</span>
          <span className="text-xs bg-amber-100 text-gray-900 px-2 py-0.5 rounded-full font-medium ml-1">Student</span>
          {user?.roomCode && (
            <>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">{user.roomCode}</span>
              <StreakDisplay />
            </>
          )}
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
            <LogOut size={16} /> Leave
          </button>
        </div>
      </nav>
      <div className="md:hidden flex bg-white border-b border-slate-200 px-2">
        {navLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 flex-1 px-2 py-2 text-xs font-medium transition-all ${
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
