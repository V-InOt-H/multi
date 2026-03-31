import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Youtube, ExternalLink, Globe, Play, Loader2, Music } from "lucide-react";
import { toast } from "sonner";

interface VideoProcessorProps {
  role: "teacher" | "student";
}

export default function VideoProcessor({ role }: VideoProcessorProps) {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    transcript: string;
    translation: string;
    audio: string;
  } | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");

  const getEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const handleProcess = async () => {
    if (!videoUrl) return toast.error("Please provide a video URL");
    if (!user) return;

    setIsProcessing(true);
    setResult(null);

    const embed = getEmbedUrl(videoUrl);
    setEmbedUrl(embed);

    try {
      // Use the new transcribeVideo endpoint from api.ts
      const data = await api.post<any>("/api/video/process", {
        url: videoUrl,
        language: targetLang
      }, user.token);

      setResult({
        transcript: data.transcript,
        translation: data.translation,
        audio: data.audio
      });
      toast.success("Video processed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process video");
      setEmbedUrl("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Youtube className="text-red-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Process Video Link</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">YouTube URL</label>
            <div className="relative">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 bg-[#FFF9E6] border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
              <ExternalLink size={18} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full px-4 py-2 bg-[#FFF9E6] border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              {["Hindi", "Tamil", "Telugu", "Bengali", "Kannada", "Marathi", "Gujarati", "Malayalam", "Punjabi"].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full bg-[#111827] hover:bg-[#030712] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <Play size={20} />
              Process & Dub Video
            </>
          )}
        </button>
      </div>

      {embedUrl && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video border border-slate-800">
              <iframe
                src={embedUrl}
                title="YouTube mirror"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            {result?.audio && (
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-gray-900">
                  <Music size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1">Dubbed Audio in {targetLang}</p>
                  <audio controls className="w-full h-8">
                    <source src={`data:audio/mp3;base64,${result.audio}`} type="audio/mp3" />
                  </audio>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="text-gray-400" size={18} />
                <h3 className="font-bold text-slate-800">Translation ({targetLang})</h3>
              </div>
              <div className="bg-[#FFF9E6] p-4 rounded-xl border border-slate-100 min-h-[120px] max-h-[250px] overflow-y-auto text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center h-24 text-slate-400 gap-2">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Translating video content...</span>
                  </div>
                ) : result?.translation ? (
                  result.translation
                ) : (
                  "The translation will appear here after processing."
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Youtube className="text-red-500" size={18} />
                <h3 className="font-bold text-slate-800">Original Transcript (English)</h3>
              </div>
              <div className="bg-[#FFF9E6] p-4 rounded-xl border border-slate-100 min-h-[120px] max-h-[250px] overflow-y-auto text-slate-700 text-sm leading-relaxed opacity-60">
                {isProcessing ? "Waiting for Whisper..." : result?.transcript || "Original transcript will appear here."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
