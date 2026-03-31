"""
IndicTrans2 Translation Service — FastAPI
Run: uvicorn translation_server:app --host localhost --port 8002

Requirements:
  pip install fastapi uvicorn transformers torch sentencepiece
  pip install git+https://github.com/AI4Bharat/IndicTransToolkit.git

Model: ai4bharat/indictrans2-en-indic-dist-200M (lightweight version)
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="IndicTrans2 Translation Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_model = None
_tokenizer = None
_processor = None

LANG_MAP = {
    "hindi": "hin_Deva",
    "tamil": "tam_Taml",
    "telugu": "tel_Telu",
    "bengali": "ben_Beng",
    "kannada": "kan_Knda",
    "malayalam": "mal_Mlym",
    "marathi": "mar_Deva",
    "punjabi": "pan_Guru",
    "gujarati": "guj_Gujr",
    "odia": "ory_Orya",
    "english": "eng_Latn",
}

def load_model():
    global _model, _tokenizer, _processor
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    from IndicTransToolkit import IndicProcessor
    import torch

    model_name = os.environ.get("INDICTRANS_MODEL", "ai4bharat/indictrans2-en-indic-dist-200M")
    print(f"Loading IndicTrans2: {model_name}")
    _tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    _model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)
    _processor = IndicProcessor(inference=True)
    print("IndicTrans2 loaded.")

class TranslationRequest(BaseModel):
    texts: List[str]
    src_lang: str = "eng_Latn"
    tgt_lang: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "indictrans2"}

@app.post("/translate")
async def translate(req: TranslationRequest):
    import torch
    if _model is None:
        load_model()

    tgt_code = LANG_MAP.get(req.tgt_lang.lower(), req.tgt_lang)
    src_code = LANG_MAP.get(req.src_lang.lower(), req.src_lang)
    # Fallback: if src_code is not a valid FLORES code, default to English
    valid_codes = set(LANG_MAP.values())
    if src_code not in valid_codes:
        src_code = "eng_Latn"
    if tgt_code not in valid_codes:
        return {"translations": req.texts, "src_lang": src_code, "tgt_lang": req.tgt_lang, "error": "Unknown target language"}
    batch = _processor.preprocess_batch(req.texts, src_lang=src_code, tgt_lang=tgt_code)

    inputs = _tokenizer(
        batch, truncation=True, padding="longest",
        return_tensors="pt", return_attention_mask=True
    )

    with torch.no_grad():
        outputs = _model.generate(
            **inputs, num_beams=5, num_return_sequences=1, max_length=256
        )

    decoded = _tokenizer.batch_decode(outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    translations = _processor.postprocess_batch(decoded, lang=tgt_code)

    return {"translations": translations, "src_lang": req.src_lang, "tgt_lang": tgt_code}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8002)
