import { useNavigate } from "react-router";
import { GraduationCap, Users, Mic, Globe, Zap, Shield, ArrowRight, CheckCircle } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF9E6" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/8">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-gray-800" />
          <span className="font-semibold text-gray-900">EduSense</span>
          <span className="text-xs text-gray-500 hidden sm:inline">Multilingual Lecture Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/auth/student-login")}
            className="text-sm px-4 py-1.5 rounded-lg border border-black/15 hover:bg-black/5 text-gray-700 transition-colors"
          >
            Join Session
          </button>
          <button
            onClick={() => navigate("/auth/teacher-login")}
            className="text-sm px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            Register as Lecturer
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 pt-16 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Interactive Lecture Platform
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mb-8">
          Real-time transcription, translation, and engagement tracking for modern classrooms
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/auth/student-login")}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <Users size={16} />
            Join Session
          </button>
          <button
            onClick={() => navigate("/auth/teacher-login")}
            className="flex items-center gap-2 border border-black/15 hover:bg-black/5 text-gray-800 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <GraduationCap size={16} />
            Register as Lecturer
          </button>
        </div>
      </div>

      {/* Choose Your Path */}
      <div className="px-6 pb-10 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Choose Your Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Lecturer card */}
          <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-4">
              <GraduationCap size={20} className="text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">I'm a Lecturer</h3>
            <p className="text-gray-500 text-sm mb-5">
              Create engaging lectures with real-time transcription, multi-language support, and student analytics
            </p>
            <ul className="space-y-2 mb-6">
              {["Live lecture transcription", "9+ language translations", "Student engagement tracking", "Auto-generated summaries"].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-gray-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/auth/teacher-login")}
              className="mt-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Register Now <ArrowRight size={14} />
            </button>
          </div>

          {/* Student card */}
          <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-4">
              <Users size={20} className="text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">I'm a Student</h3>
            <p className="text-gray-500 text-sm mb-5">
              Join lectures in your preferred language and track your understanding in real-time
            </p>
            <ul className="space-y-2 mb-6">
              {["Read in your language", "Get lecture summaries", "Interactive quizzes", "Quick session joining"].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-amber-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/auth/student-register")}
              className="mt-auto flex items-center justify-center gap-2 border border-black/15 hover:bg-[#FFF9E6] text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Register Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">Platform Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Mic, label: "Live Transcription", desc: "Whisper AI speech-to-text" },
            { icon: Globe, label: "9+ Languages", desc: "IndicTrans2 translation" },
            { icon: Zap, label: "Real-Time", desc: "WebSocket-powered" },
            { icon: Shield, label: "RBAC Auth", desc: "Teacher & student roles" },
            { icon: GraduationCap, label: "AI Summaries", desc: "Auto chapter generation" },
            { icon: Users, label: "Attendance", desc: "Live student tracking" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-black/10 text-left">
              <Icon className="text-gray-500 mb-2" size={18} />
              <div className="font-medium text-gray-800 text-sm">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
