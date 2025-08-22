// Ensure SA JSON is materialized to /tmp and GOOGLE_APPLICATION_CREDENTIALS is set
import "./bootstrap/google-creds";

import { createClient } from "@supabase/supabase-js";
import vision from "@google-cloud/vision";
import OpenAI from "openai";

(async () => {
  console.log("=== Integration Diagnostic ===");

  // Supabase
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("truth_checks")
      .select("*")
      .limit(1);
    if (error) throw error;
    console.log("✅ Supabase: Live (data rows:", data?.length, ")");
  } catch (e) {
    console.error("❌ Supabase: Mock or failed →", (e as Error).message);
  }

  // Google Vision
  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.safeSearchDetection(
      "https://storage.googleapis.com/cloud-vision/demo-img/logo.png",
    );
    if (result.safeSearchAnnotation) {
      console.log("✅ Google Vision: Live (SafeSearch categories present)");
    } else {
      throw new Error("No SafeSearch results");
    }
  } catch (e) {
    console.error("❌ Google Vision: Mock or failed →", (e as Error).message);
  }

  // OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Reply with 'pong' only" }],
    });
    console.log("✅ OpenAI: Live →", chat.choices[0].message.content);
  } catch (e) {
    console.error("❌ OpenAI: Mock or failed →", (e as Error).message);
  }

  console.log("=== Diagnostic Complete ===");
})();
