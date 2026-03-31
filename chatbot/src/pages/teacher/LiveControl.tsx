import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Users, Play, Square, Zap, Globe, AlertTriangle, Video, Camera } from "lucide-react";
import { toast } from "sonner";
import NotebookUploader from "../../app/components/NotebookUploader";
import NotebookList from "../../app/components/NotebookList";

interface Student { name: string; socketId: string; joinTime: number; confusionCount: number; lastActive: number; }
interface TranscriptEntry { text: string; timestamp: number; }
interface ConfusionAlert { name: string; time: number; message?: string; }

export default function LiveControl() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [translation, setTranslation] = useState<TranscriptEntry[]>([]);
  const [confusion, setConfusion] = useState<ConfusionAlert[]>([]);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [refreshNotebooks, setRefreshNotebooks] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const roomCode = user?.roomCode;

  useEffect(() => {
    if (!user || !roomCode) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || "", { path: "/socket.io" });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("join_room", { roomCode, name: user.name, role: "teacher" }));
    socket.on("student_joined", (data) => toast.success(`${data.name} joined`));
    socket.on("attendance_update", ({ students: s }) => setStudents(s || []));
    socket.on("confusion_alert", (data) => {
      setConfusion(prev => [data, ...prev].slice(0, 20));
      toast.warning(`${data.name} is confused`);
    });
    socket.on("student_question", (data) => {
      setConfusion(prev => [{ ...data, isQuestion: true }, ...prev].slice(0, 20));
      toast.info(`Question from ${data.name}: ${data.message}`);
    });
    // Listen for new notes uploaded (to refresh local list if opened)
    socket.on("notebook_uploaded", () => {
      setRefreshNotebooks(prev => prev + 1);
    });
    
    return () => { socket.disconnect(); };
  }, [user?.id, roomCode]);

  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices) { toast.error("Microphone/Camera not supported"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = async (e) => {
        if (e.data.size < 500 || !user) return;
        
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = reader.result;
          socketRef.current?.emit("video_chunk", { roomCode, buffer, timestamp: Date.now() });
        };
        reader.readAsArrayBuffer(e.data);

        try {
          const result = await api.transcribeAudio(e.data, user.sessionId || "", "auto", user.token);
          if (result.text?.trim()) {
            const entry = { text: result.text, timestamp: Date.now() };
            setTranscript(prev => [...prev, entry]);
            socketRef.current?.emit("transcript_chunk", { roomCode, text: result.text, timestamp: Date.now() });
            
            try {
              const tr = await api.translate([result.text], "English", "Hindi", user.token);
              if (tr.translations[0]) {
                const tEntry = { text: tr.translations[0], timestamp: Date.now() };
                setTranslation(prev => [...prev, tEntry]);
                socketRef.current?.emit("translation_update", { roomCode, text: tr.translations[0], language: "Hindi", timestamp: Date.now() });
              }
            } catch { /* translation optional */ }
          }
        } catch (err) { console.error("Transcription:", err); }
      };

      mr.start(8000); // chunk every 8 seconds
      setIsRecording(true);
      setIsLive(true);
      socketRef.current?.emit("lecture_started", { roomCode, time: Date.now() });
      toast.success("Broadcast started");
    } catch (e) { 
      console.error(e);
      toast.error("Could not access camera/microphone"); 
    }
  }, [user, roomCode]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsRecording(false);
    socketRef.current?.emit("lecture_stopped", { roomCode, time: Date.now() });
    toast.info("Broadcast stopped");
  }, [roomCode]);

  const handleGenerateSummary = async () => {
    if (!user?.sessionId) { toast.error("No active session"); return; }
    setGeneratingSummary(true);
    try {
      const result = await api.generateSummary(user.sessionId, user.token);
      socketRef.current?.emit("push_summary", { roomCode, summary: result.summary, chapters: result.chapters });
      toast.success("Summary generated and pushed to students");
    } catch { toast.error("Failed to generate summary"); }
    finally { setGeneratingSummary(false); }
  };

  const handlePushQuiz = async () => {
    if (!user?.sessionId) { toast.error("No active session"); return; }
    try {
      const result = await api.generateQuiz(user.sessionId, 5, user.token);
      socketRef.current?.emit("push_quiz", { roomCode, quizId: result.quizId, questions: result.questions });
      toast.success("Quiz pushed to students");
    } catch { toast.error("Failed to generate quiz"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Control</h1>
          {roomCode && <p className="text-slate-500 text-sm">Room: <span className="font-mono font-bold text-gray-900">{roomCode}</span></p>}
        </div>
        {isLive && <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> LIVE STREAM</span>}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Camera Preview */}
        <div className="bg-black rounded-xl border border-slate-200 shadow-sm overflow-hidden aspect-video relative flex items-center justify-center">
            {!isRecording ? (
                <div className="text-center text-slate-500">
                    <Camera size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera preview will appear here</p>
                </div>
            ) : (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            )}
            <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Teacher View</span>
            </div>
        </div>

        {/* Notebook & Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-4 space-y-4">
          <div className="flex-1 space-y-4">
            <NotebookUploader 
              roomCode={roomCode || ""} 
              onUploadSuccess={() => {
                setRefreshNotebooks(prev => prev + 1);
                socketRef.current?.emit("notebook_uploaded", { roomCode });
              }}
            />
            {roomCode && <NotebookList roomCode={roomCode} refreshKey={refreshNotebooks} />}
          </div>
          
          <div className="space-y-3 pt-2">
            {!isRecording ? (
              <button onClick={startRecording}
                className="w-full bg-[#111827] hover:bg-[#030712] text-white rounded-xl py-4 font-bold flex items-center justify-center gap-3 shadow-lg shadow-black/5 transition-all active:scale-95">
                <Play size={20} /> START LIVE LECTURE
              </button>
            ) : (
              <button onClick={stopRecording}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-100 transition-all animate-pulse active:scale-95">
                <Square size={20} /> STOP BROADCAST
              </button>
            )}
            
            <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={handleGenerateSummary} disabled={generatingSummary}
                className="bg-[#FFF9E6] hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60 text-sm">
                {generatingSummary ? "..." : "Push Summary"}
                </button>
                <button onClick={handlePushQuiz}
                className="bg-[#FFF9E6] hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 font-medium flex items-center justify-center gap-2 transition-all text-sm">
                Push Quiz
                </button>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
            <Mic size={16} className="text-gray-400" />
            <span className="font-semibold text-slate-700 text-sm">Live Transcript</span>
          </div>
          <div className="h-48 overflow-y-auto p-3 space-y-2">
            {transcript.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-8">Transcripts will appear here</p>
            ) : transcript.map((t, i) => (
              <div key={i} className="text-sm text-slate-700 leading-relaxed border-l-2 border-black/5 pl-3 py-1">
                <span className="text-[10px] text-slate-400 font-mono block mb-1 uppercase">{new Date(t.timestamp).toLocaleTimeString()}</span>
                {t.text}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><Users size={16} className="text-green-500" /><span className="font-semibold text-slate-700 text-sm">Live Attendance</span></div>
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{students.length} joined</span>
          </div>
          <div className="h-48 overflow-y-auto divide-y divide-slate-50">
            {students.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-8">No students in room</p>
            ) : students.map(s => (
              <div key={s.socketId} className="flex items-center justify-between px-3 py-2.5 hover:bg-[#FFF9E6] transition-colors">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-medium text-slate-800">{s.name}</span>
                </div>
                {s.confusionCount > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">{s.confusionCount} confused</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confusion feed */}
      {confusion.length > 0 && (
        <div className="bg-white rounded-xl border-t-4 border-amber-400 shadow-sm">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="font-semibold text-slate-700 text-sm">Urgent Alerts</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-40 overflow-y-auto">
            {confusion.map((c, i) => (
              <div key={i} className="px-3 py-3 flex items-start gap-3 hover:bg-amber-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 text-xs font-bold">
                    {c.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono italic">{new Date(c.time).toLocaleTimeString()}</span>
                  </div>
                  {c.message && <p className="text-sm text-slate-600 mt-0.5 italic">"${c.message}"</p>}
                  {!c.message && <p className="text-sm text-slate-600 mt-0.5 italic">Indicated confusion about current topic</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
