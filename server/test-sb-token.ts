import jwt from "jsonwebtoken";

const token = process.env.SUPABASE_JWT_SECRET;

if (!token) {
  console.error(
    "❌ SB_TEST_TOKEN is missing. Did you set it in Replit Secrets?",
  );
  process.exit(1);
}

try {
  const decoded = jwt.decode(token, { complete: true });
  console.log("✅ SB_TEST_TOKEN is present!");
  console.log("Token length:", token.length);
  console.log("Decoded header:", decoded?.header);
  console.log("Decoded payload:", decoded?.payload);
} catch (err) {
  console.error("❌ Failed to decode SB_TEST_TOKEN:", err);
}
