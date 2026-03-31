"""
EdgeTTS Service — FastAPI
Run: uvicorn tts_server:app --host localhost --port 8003

Requirements:
  pip install fastapi uvicorn edge-tts
"""

from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
import io

app = FastAPI(title="EdgeTTS Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

EDGE_VOICES = {
    "hindi": "hi-IN-SwaraNeural",
    "tamil": "ta-IN-PallaviNeural",
    "telugu": "te-IN-ShrutiNeural",
    "bengali": "bn-IN-TanishaaNeural",
    "kannada": "kn-IN-SapnaNeural",
    "english": "en-US-AriaNeural",
    "marathi": "mr-IN-AarohiNeural",
    "gujarati": "gu-IN-DhwaniNeural",
    "malayalam": "ml-IN-SobhanaNeural",
    "punjabi": "pa-IN-OjasNeural",
}

class TTSRequest(BaseModel):
    text: str
    language: str = "english"

@app.get("/health")
def health():
    return {"status": "ok", "service": "edge-tts"}

@app.post("/synthesize")
async def synthesize(req: TTSRequest):
    voice = EDGE_VOICES.get(req.language.lower(), "en-US-AriaNeural")
    try:
        communicate = edge_tts.Communicate(req.text, voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        if not audio_data:
            return JSONResponse(status_code=500, content={"error": "No audio generated"})
        return StreamingResponse(io.BytesIO(audio_data), media_type="audio/mp3")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8003)
