"""
Whisper STT Service — FastAPI
Run: uvicorn whisper_server:app --host localhost --port 8001

Requirements:
  pip install fastapi uvicorn openai-whisper ffmpeg-python python-multipart

Note: Requires ffmpeg installed (apt install ffmpeg or brew install ffmpeg)
"""

from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import subprocess
import os

app = FastAPI(title="Whisper STT Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class UrlRequest(BaseModel):
    url: str
    language: str = "auto"

# Lazy-load model to avoid startup delay
_model = None

def get_model():
    global _model
    if _model is None:
        import whisper
        model_size = os.environ.get("WHISPER_MODEL", "base")  # base/small/medium/large-v3
        print(f"Loading Whisper model: {model_size}")
        _model = whisper.load_model(model_size)
        print("Whisper model loaded.")
    return _model

@app.get("/health")
def health():
    return {"status": "ok", "service": "whisper-stt"}

@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(default="auto")
):
    import ffmpeg
    import traceback

    # Preserve file extension
    ext = os.path.splitext(file.filename)[1] if file.filename else ".audio"
    if not ext:
        ext = ".audio"

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    converted_path = tmp_path + "_converted.wav"
    try:
        # FFmpeg: convert to 16kHz mono WAV (required by Whisper)
        try:
            (
                ffmpeg.input(tmp_path)
                .output(converted_path, ar=16000, ac=1, format="wav")
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            print("FFmpeg error:", e.stderr.decode() if e.stderr else str(e))
            raise RuntimeError(f"FFmpeg processing failed: {e.stderr.decode() if e.stderr else str(e)}")
        
        model = get_model()
        result = model.transcribe(
            converted_path,
            language=None if language == "auto" else language,
            task="transcribe",
            fp16=False,
            word_timestamps=True,
        )

        return {
            "text": result["text"],
            "language": result["language"],
            "segments": result["segments"],
            "words": [w for seg in result["segments"] for w in seg.get("words", [])],
        }
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        if os.path.exists(converted_path):
            os.unlink(converted_path)


@app.post("/transcribe_url")
async def transcribe_url(req: UrlRequest):
    import ffmpeg
    import traceback

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp_path = tmp.name
        
    out_path = tmp_path + "_converted.wav"
    
    try:
        # Download best audio using yt-dlp
        # We assume yt-dlp is in the path
        result = subprocess.run(["yt-dlp", "-f", "bestaudio", "-o", tmp_path, req.url], capture_output=True)
        if result.returncode != 0:
            raise RuntimeError(f"yt-dlp failed: {result.stderr.decode()}")

        # Convert to 16kHz wav for whisper
        try:
            (
                ffmpeg.input(tmp_path)
                .output(out_path, ar=16000, ac=1, format="wav")
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            raise RuntimeError(f"FFmpeg processing failed: {e.stderr.decode() if e.stderr else str(e)}")
        
        # Transcribe
        model = get_model()
        result = model.transcribe(
            out_path,
            language=None if req.language == "auto" else req.language,
            task="transcribe",
            fp16=False,
        )
        
        return {
            "text": result["text"],
            "language": result["language"]
        }
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        if os.path.exists(out_path):
            os.unlink(out_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8001)
