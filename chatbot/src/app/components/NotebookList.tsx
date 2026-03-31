import React, { useEffect, useState, useCallback } from "react";
import { FileText, Download, Clock, Size, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface NotebookEntry {
  id: string;
  roomCode: string;
  title: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadTime: number;
  url: string;
}

interface NotebookListProps {
  roomCode: string;
  token?: string;
  refreshKey?: number; // External trigger for refresh
}

export default function NotebookList({ roomCode, refreshKey }: NotebookListProps) {
  const [notebooks, setNotebooks] = useState<NotebookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotebooks = useCallback(async () => {
    if (!roomCode) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notebooks/${roomCode}`);
      if (!response.ok) throw new Error("Failed to fetch notebooks");
      const data = await response.json();
      setNotebooks(data);
    } catch (error) {
      console.error("Fetch notebooks error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks, refreshKey]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleDownload = (notebook: NotebookEntry) => {
    const downloadUrl = `${import.meta.env.VITE_API_URL}/api/notebooks/download/${notebook.fileName}`;
    window.open(downloadUrl, "_blank");
    toast.info(`Downloading ${notebook.title}...`);
  };

  return (
    <Card className="flex flex-col h-full bg-white border border-slate-200 shadow-none">
      <CardHeader className="p-3 border-b border-slate-100 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="size-4 text-indigo-500" />
            Lecture Materials
          </CardTitle>
          <CardDescription className="text-[10px]">
            Resources uploaded by your lecturer.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="size-8" onClick={fetchNotebooks}>
          <RefreshCw className={isLoading ? "size-3 animate-spin" : "size-3"} />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[200px] p-3">
          {isLoading && notebooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Loader2 className="size-6 animate-spin mb-2 opacity-20" />
              <p className="text-[10px]">Syncing notes...</p>
            </div>
          ) : notebooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <FileText className="size-8 mb-2 opacity-10" />
              <p className="text-xs">No materials uploaded yet.</p>
              <p className="text-[10px] opacity-60">Check back later during the lecture.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notebooks.map((notebook) => (
                <div 
                  key={notebook.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-50 bg-[#FFF9E6]/30 hover:bg-[#FFF9E6]/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-none mb-1">{notebook.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-0.5"><Clock className="size-2.5" />{getTimeAgo(notebook.uploadTime)}</span>
                        <span>•</span>
                        <span>{formatSize(notebook.size)}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="size-8 rounded-full p-0 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => handleDownload(notebook)}
                  >
                    <Download className="size-3 text-white" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
