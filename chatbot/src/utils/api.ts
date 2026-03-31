const BASE_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach server. Please try again in a moment.");
  }
  let data: Record<string, string> = {};
  try {
    const text = await res.text();
    if (text) data = JSON.parse(text);
  } catch {
    throw new Error(`Server error (status ${res.status}). Please try again.`);
  }
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>("GET", path, undefined, token),
  post: <T>(path: string, body: unknown, token?: string) => request<T>("POST", path, body, token),

  // Auth
  teacherLogin: (email: string, password: string) =>
    api.post<{ token: string; userId: string; name: string; role: string }>("/api/auth/teacher/login", { email, password }),
  teacherRegister: (email: string, password: string, name: string) =>
    api.post<{ token: string; userId: string; name: string; role: string }>("/api/auth/teacher/register", { email, password, name }),
  studentLogin: (name: string, roomCode: string) =>
    api.post<{ token: string; userId: string; name: string; role: string; roomCode: string }>("/api/auth/student/login", { name, roomCode }),
  studentLoginEmail: (email: string, password: string) =>
    api.post<{ token: string; userId: string; name: string; role: string }>("/api/auth/student/login-email", { email, password }),
  studentRegister: (data: { name: string; email: string; studentId: string; year: string; course: string; password: string }) =>
    api.post<{ token: string; userId: string; name: string; role: string }>("/api/auth/student/register", data),

  // Sessions
  createSession: (body: unknown, token: string) =>
    api.post<{ roomCode: string; sessionId: string }>("/api/sessions/create", body, token),
  joinSession: (roomCode: string, name: string) =>
    api.post<{ sessionId: string; title: string; topic: string }>("/api/sessions/join", { roomCode, name }),
  getSessions: (token: string) =>
    api.get<unknown[]>("/api/sessions", token),
  endSession: (sessionId: string, token: string) =>
    api.post<unknown>(`/api/sessions/${sessionId}/end`, {}, token),

  // Summary
  generateSummary: (sessionId: string, token: string) =>
    api.post<{ summary: string; chapters: unknown[]; actionItems: unknown[] }>("/api/summary/generate", { sessionId }, token),
  getSummary: (sessionId: string, token: string) =>
    api.get<{ summary: string; chapters: unknown[]; actionItems: unknown[]; transcript: unknown[] }>(`/api/summary/${sessionId}`, token),

  // Quiz
  generateQuiz: (sessionId: string, count: number, token: string) =>
    api.post<{ quizId: string; questions: unknown[] }>("/api/quiz/generate", { sessionId, count }, token),

  // Translation
  translate: (texts: string[], srcLang: string, tgtLang: string, token: string) =>
    api.post<{ translations: string[] }>("/api/translation/translate", { texts, srcLang, tgtLang }, token),

  // Text-to-Speech (EdgeTTS)
  synthesizeAudio: (text: string, language: string, token: string) =>
    api.post<{ audio: string; contentType: string; source: string }>("/api/tts/synthesize", { text, language }, token),

  // Upload audio for transcription
  transcribeAudio: async (blob: Blob, sessionId: string, language: string, token: string) => {
    const form = new FormData();
    form.append("audio", blob, "audio.webm");
    form.append("sessionId", sessionId);
    form.append("language", language);
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/api/transcription/chunk`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
    } catch {
      throw new Error("Cannot reach server.");
    }
    let data: { text?: string; language?: string; error?: string } = {};
    try {
      const text = await res.text();
      if (text) data = JSON.parse(text);
    } catch {
      throw new Error("Transcription failed (server error)");
    }
    if (!res.ok) throw new Error(data.error || "Transcription failed");
    return data as { text: string; language: string };
  },
};
