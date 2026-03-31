import { useState, useEffect } from "react";
import { Flame, Loader2 } from "lucide-react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function StreakDisplay() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user?.token) return;
      try {
        const data = await api.get<{ streak: number }>("/api/streak", user.token);
        setStreak(data.streak);
      } catch (err) {
        console.error("Failed to fetch streak:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, [user?.token]);

  if (loading) return <Loader2 size={16} className="animate-spin text-slate-400" />;
  if (streak === null || streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-default">
      <Flame size={16} className="fill-amber-500 text-amber-600 animate-pulse" />
      <span className="text-xs font-bold leading-none">{streak} Day Streak</span>
    </div>
  );
}
