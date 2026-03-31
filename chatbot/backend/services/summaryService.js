const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(systemPrompt, userContent) {
  const res = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, timeout: 30000 });
  return JSON.parse(res.data.choices[0].message.content);
}

async function generateSummary(transcript, title, topic) {
  if (OPENAI_API_KEY) {
    try {
      const result = await callOpenAI(
        `You are an AI assistant that generates structured lecture summaries. Return JSON with keys: summary (string), chapters (array of {title, startMinute, description}), actionItems (array of {text, assignedTo}).`,
        `Lecture title: "${title}"\nTopic: "${topic}"\n\nTranscript:\n${transcript.slice(0, 8000)}`
      );
      return result;
    } catch (err) {
      console.warn("OpenAI summary failed:", err.message);
    }
  }

  // Extractive fallback summary
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const summary = sentences.slice(0, 5).join(". ") + ".";
  const chapters = [
    { title: "Introduction", startMinute: 0, description: sentences.slice(0, 2).join(". ") },
    { title: "Main Content", startMinute: 5, description: sentences.slice(2, 5).join(". ") },
  ];
  const actionItems = [];
  return { summary, chapters, actionItems, source: "extractive-fallback" };
}

async function generateQuiz(transcript, count = 5) {
  if (OPENAI_API_KEY) {
    try {
      const result = await callOpenAI(
        `You are a quiz generator. Return JSON with key: questions (array of {question, options: [A,B,C,D], answer: "A"|"B"|"C"|"D", explanation}).`,
        `Generate ${count} multiple-choice questions from this lecture transcript:\n${transcript.slice(0, 5000)}`
      );
      return result.questions || [];
    } catch (err) {
      console.warn("OpenAI quiz failed:", err.message);
    }
  }
  // Demo quiz fallback
  return Array.from({ length: count }, (_, i) => ({
    question: `Question ${i + 1}: What is a key concept from this lecture?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: "A",
    explanation: "Review the lecture transcript for this answer.",
  }));
}

module.exports = { generateSummary, generateQuiz };
