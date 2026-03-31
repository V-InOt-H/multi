import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { io, Socket } from "socket.io-client";
import { Frown, Globe, Volume2, MessageSquare, Mic, Play, Loader2, Video as VideoIcon } from "lucide-react";
import { api } from "../../utils/api";
import { toast } from "sonner";
import NotebookList from "../../app/components/NotebookList";

interface TranscriptEntry { text: string; timestamp: number; }
interface VideoChunk { buffer: ArrayBuffer; timestamp: number; audio?: string; played: boolean; }

export default function LiveLecture() {
  const { user } = useAuth();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [translation, setTranslation] = useState<TranscriptEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [confusedSent, setConfusedSent] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [selectedLang, setSelectedLang] = useState("Hindi");
  const [refreshNotebooks, setRefreshNotebooks] = useState(0);
  
  // Latency & Dubbing matching states
  const [videoQueue, setVideoQueue] = useState<VideoChunk[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const dubbingPlayerRef = useRef<HTMLAudioElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const roomCode = user?.roomCode;

  // 1. Socket Setup
  useEffect(() => {
    if (!user || !roomCode) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || "", { path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", { roomCode, name: user.name, role: "student" });
    });

    socket.on("lecture_started", () => { 
        setIsLive(true); 
        setIsSyncing(true);
        toast.success("Lecture started! Syncing video..."); 
    });

    socket.on("lecture_stopped", () => { 
        setIsLive(false); 
        setIsSyncing(false);
        setVideoQueue([]);
        toast.info("Lecture ended"); 
    });

    socket.on("video_chunk", (data: { buffer: ArrayBuffer, timestamp: number }) => {
        setIsLive(true);
        setVideoQueue(prev => [...prev, { ...data, played: false }]);
    });

    socket.on("transcript_update", (data) => {
      setTranscript(prev => [...prev, { text: data.text, timestamp: data.timestamp || Date.now() }]);
    });

    socket.on("translation_update", async (data) => {
      setTranslation(prev => [...prev, { text: data.text, timestamp: data.timestamp || Date.now(), language: data.language }]);
      
      try {
        const ttsResult = await api.synthesizeAudio(data.text, data.language, user.token);
        if (ttsResult.audio) {
            setVideoQueue(prev => {
                const next = [...prev];
                const target = next.find(chunk => !chunk.audio && !chunk.played);
                if (target) target.audio = ttsResult.audio;
                return next;
            });
        }
      } catch (err) {
          console.error("TTS fetch error:", err);
      }
    });

    socket.on("notebook_uploaded", () => {
      setRefreshNotebooks(prev => prev + 1);
      toast.info("New lecture materials uploaded!");
    });

    return () => { socket.disconnect(); };
  }, [user, roomCode]);

  // 2. Playback Loop
  useEffect(() => {
    const playNext = async () => {
        if (!isLive || currentlyPlaying !== null) return;

        const nextIdx = videoQueue.findIndex(chunk => chunk.audio && !chunk.played);
        
        if (nextIdx !== -1) {
            const chunk = videoQueue[nextIdx];
            setCurrentlyPlaying(nextIdx);
            setIsSyncing(false);

            setVideoQueue(prev => {
                const next = [...prev];
                next[nextIdx].played = true;
                return next;
            });

            if (videoPlayerRef.current && dubbingPlayerRef.current) {
                const videoBlob = new Blob([chunk.buffer], { type: "video/webm" });
                videoPlayerRef.current.src = URL.createObjectURL(videoBlob);
                dubbingPlayerRef.current.src = `data:audio/mp3;base64,${chunk.audio}`;
                
                try {
                    await Promise.all([
                        videoPlayerRef.current.play(),
                        dubbingPlayerRef.current.play()
                    ]);
                } catch (e) {
                    console.error("Playback error:", e);
                }
            }
        } else if (videoQueue.filter(c => !c.played).length > 2) {
             setIsSyncing(true);
        }
    };

    const interval = setInterval(playNext, 1000);
    return () => clearInterval(interval);
  }, [videoQueue, currentlyPlaying, isLive]);

  const handleChunkEnd = () => {
      setCurrentlyPlaying(null);
  };

  const sendConfused = useCallback(() => {
    if (!roomCode) return;
    socketRef.current?.emit("student_confused", { roomCode, name: user?.name, timestamp: Date.now() });
    setConfusedSent(true);
    toast.info("Sent confused signal to teacher");
    setTimeout(() => setConfusedSent(false), 5000);
  }, [roomCode, user?.name]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isLive ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"}`}>
            <VideoIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Live Class</h1>
            <p className="text-slate-500 text-xs font-medium">Room: <span className="font-mono text-gray-900">{roomCode}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Language</span>
                <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 outline-none shadow-sm transition-all">
                {["Hindi", "Tamil", "Telugu", "Bengali", "Kannada", "Marathi", "Gujarati", "Malayalam", "Punjabi"].map(l => <option key={l}>{l}</option>)}
                </select>
            </div>
            {isLive ? (
                <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold animate-pulse shadow-lg shadow-red-100">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                </div>
            ) : (
                <div className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Offline</div>
            )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border border-slate-800 relative group">
                {!isLive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Mic size={32} className="opacity-20" />
                        </div>
                        <p className="font-medium">Waiting for teacher to start broadcast...</p>
                        <p className="text-xs opacity-50 mt-1">Once started, audio will automatically play in {selectedLang}</p>
                    </div>
                ) : isSyncing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/80 backdrop-blur-sm z-10">
                        <Loader2 size={40} className="animate-spin mb-4 text-indigo-400" />
                        <p className="font-bold text-lg">Syncing with AI Dubbing...</p>
                        <p className="text-xs opacity-70 mt-1">Matching video latency with {selectedLang} voice acting</p>
                    </div>
                ) : null}
                
                <video 
                    ref={videoPlayerRef} 
                    onEnded={handleChunkEnd}
                    className="w-full h-full object-contain"
                />
                <audio ref={dubbingPlayerRef} />
                
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-black/60 backdrop-blur shadow text-white text-[10px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                        <Globe size={12} className="text-indigo-300" /> AI Dubbed: {selectedLang}
                    </span>
                    <span className="bg-black/60 backdrop-blur shadow text-white text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-tighter">
                        Latency Matched
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={sendConfused} disabled={confusedSent || !isLive}
                    className={`flex-1 rounded-xl px-6 py-4 font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${
                        confusedSent ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100"
                    } disabled:opacity-30 disabled:grayscale`}>
                    <Frown size={20} /> {confusedSent ? "Signal Sent!" : "I'm Confused"}
                </button>
                <button onClick={() => setShowQuestionModal(true)} disabled={!isLive}
                    className="flex-1 bg-white hover:bg-[#FFF9E6] text-slate-700 border border-slate-200 rounded-xl px-6 py-4 font-bold flex items-center justify-center gap-3 shadow-sm transition-all active:scale-95 disabled:opacity-30">
                    <MessageSquare size={20} /> Ask Question
                </button>
            </div>
            
            {/* NEW: Notebook section in main area for mobile/better reach */}
            <div className="block lg:hidden">
                <NotebookList roomCode={roomCode || ""} refreshKey={refreshNotebooks} />
            </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-5">
            {/* NEW: Notebook Section in Sidebar */}
            <div className="hidden lg:block h-[280px]">
                <NotebookList roomCode={roomCode || ""} refreshKey={refreshNotebooks} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[200px]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mic size={16} className="text-gray-400" />
                        <span className="font-bold text-slate-800 text-sm">Live Transcript</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-medium text-slate-600 text-sm leading-relaxed scroll-smooth">
                    {transcript.length === 0 ? (
                        <p className="text-slate-300 text-center text-xs mt-10">Waiting for spoken words...</p>
                    ) : transcript.map((t, i) => (
                        <div key={i} className="bg-[#FFF9E6] p-3 rounded-xl border border-slate-100">
                             <p>{t.text}</p>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>
            </div>

            <div className="bg-gray-100/50 rounded-2xl border border-black/5 shadow-sm flex-1 flex flex-col min-h-[200px]">
                <div className="p-4 border-b border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe size={16} className="text-gray-900" />
                        <span className="font-bold text-indigo-900 text-sm">Translation</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-medium text-indigo-900/80 text-sm leading-relaxed scroll-smooth italic">
                    {translation.length === 0 ? (
                        <p className="text-indigo-300 text-center text-xs mt-10">Translations will appear here...</p>
                    ) : translation.map((t, i) => (
                        <div key={i}>
                             {t.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ask Teacher</h3>
            <textarea
              value={question} onChange={e => setQuestion(e.target.value)}
              className="w-full bg-[#FFF9E6] border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
              placeholder="What specifically would you like to ask?"
            />
            <div className="flex gap-3 mt-6">
                <button onClick={() => setShowQuestionModal(false)} className="flex-1 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-600">Dismiss</button>
              <button 
                onClick={() => {
                    const q = question;
                    setQuestion("");
                    setShowQuestionModal(false);
                    if (q.trim()) {
                        socketRef.current?.emit("student_question", { roomCode, name: user?.name, message: q, timestamp: Date.now() });
                        toast.success("Question sent!");
                    }
                }} 
                className="flex-1 bg-[#111827] text-white rounded-xl px-4 py-3 font-bold text-sm">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
