import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("[openai] Missing OPENAI_API_KEY");
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chatJSON({
  model,
  system,
  user,
  maxTokens = 1500,
}: {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}) {
  const res = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: maxTokens,
  });
  const text = res.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(text);
}