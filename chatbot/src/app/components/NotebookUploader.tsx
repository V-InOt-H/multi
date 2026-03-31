import React, { useState } from "react";
import { Upload, File, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { api } from "../../utils/api";

interface NotebookUploaderProps {
  roomCode: string;
  token?: string;
  onUploadSuccess?: (notebook: any) => void;
}

export default function NotebookUploader({ roomCode, token, onUploadSuccess }: NotebookUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.split(".")[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !roomCode) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      // Note: In a real app, I'd use a dedicated api.uploadNotebook method
      // For this implementation, I'll use a standard FormData upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomCode", roomCode);
      formData.append("title", title);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notebooks/upload`, {
        method: "POST",
        body: formData,
        // Header with token if needed, but the current backend doesn't check it for uploads yet
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      toast.success("Notebook uploaded successfully");
      setFile(null);
      setTitle("");
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload notebook");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 bg-slate-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Upload className="size-4 text-primary" />
          Upload Lecture Notes
        </CardTitle>
        <CardDescription className="text-[10px]">
          Share PDFs, documents, or images with your students instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Input 
            type="file" 
            onChange={handleFileChange}
            className="text-xs h-8 bg-white cursor-pointer"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
          />
          {file && (
            <Input 
              placeholder="Display Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-8 bg-white"
            />
          )}
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="w-full h-8 text-[11px] font-bold"
          size="sm"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              UPLOADING...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3" />
              PUBLISH TO STUDENTS
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
