import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { io, Socket } from "socket.io-client";
import { HelpCircle, CheckCircle, XCircle, Clock } from "lucide-react";

interface Question { question: string; options: string[]; answer: string; explanation?: string; }

export default function Quiz() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roomCode = user?.roomCode;

  useEffect(() => {
    if (!user || !roomCode) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || "", { path: "/socket.io" });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("join_room", { roomCode, name: user.name, role: "student" }));
    socket.on("quiz_pushed", (data) => {
      if (data.questions?.length) {
        setQuestions(data.questions);
        setCurrent(0); setAnswers([]); setFinished(false); setWaiting(false); setSelected(null); setTimeLeft(30);
      }
    });
    return () => { socket.disconnect(); };
  }, [user?.id, roomCode]);

  useEffect(() => {
    if (waiting || finished || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(selected || "");
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, waiting, finished]);

  const handleAnswer = (option: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(option);
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1); setSelected(null); setTimeLeft(30);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  const score = answers.filter((a, i) => a === questions[i]?.answer).length;

  if (waiting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <HelpCircle className="text-indigo-300 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Quiz</h1>
        <p className="text-slate-500">Waiting for teacher to push a quiz...</p>
        <p className="text-xs text-slate-400 mt-2">You'll be notified when a quiz is ready</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className={`text-6xl font-extrabold mb-4 ${pct >= 70 ? "text-green-600" : "text-amber-600"}`}>{pct}%</div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Quiz Complete!</h2>
        <p className="text-slate-500 mb-6">You got {score} out of {questions.length} correct</p>
        <div className="space-y-3 text-left">
          {questions.map((q, i) => (
            <div key={i} className={`p-3 rounded-xl border text-sm ${answers[i] === q.answer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-start gap-2">
                {answers[i] === q.answer ? <CheckCircle size={14} className="text-green-600 mt-0.5" /> : <XCircle size={14} className="text-red-500 mt-0.5" />}
                <div>
                  <p className="font-medium text-slate-800">{q.question}</p>
                  <p className="text-xs mt-1">Your answer: {answers[i] || "skipped"} | Correct: {q.answer}</p>
                  {q.explanation && <p className="text-xs text-slate-500 mt-1">{q.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">Question {current + 1} / {questions.length}</span>
        <span className={`flex items-center gap-1.5 text-sm font-medium ${timeLeft <= 10 ? "text-red-600" : "text-slate-600"}`}>
          <Clock size={14} /> {timeLeft}s
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div className="bg-[#111827] h-1.5 rounded-full transition-all" style={{ width: `${(timeLeft / 30) * 100}%` }} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <p className="font-semibold text-slate-900 text-lg mb-5">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const label = ["A", "B", "C", "D"][i];
            const isSelected = selected === label;
            const isCorrect = q.answer === label;
            let cls = "w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all";
            if (!selected) cls += " border-slate-200 hover:border-indigo-400 hover:bg-indigo-50";
            else if (isCorrect) cls += " border-green-500 bg-green-50 text-green-800";
            else if (isSelected) cls += " border-red-400 bg-red-50 text-red-700";
            else cls += " border-slate-200 text-slate-400";
            return (
              <button key={i} className={cls} onClick={() => !selected && handleAnswer(label)} disabled={!!selected}>
                <span className="font-bold mr-2">{label}.</span> {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
