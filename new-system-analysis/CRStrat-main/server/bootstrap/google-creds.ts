import fs from "fs";

(function writeCreds() {
  const raw = process.env.GCP_SA_KEY_JSON_RAW;
  const b64 = process.env.GCP_SA_KEY_JSON_B64;
  if (!raw && !b64) {
    console.warn("[google-creds] No GCP_SA_KEY_JSON_* secret set; Vision will try ADC/metadata.");
    return;
  }
  let json: string;
  try {
    json = raw ?? Buffer.from(b64!, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    if (parsed.type !== "service_account") {
      console.warn("[google-creds] JSON present but not a service_account");
    }
  } catch (e) {
    console.error("[google-creds] Invalid JSON in secrets:", (e as Error).message);
    return;
  }
  const path = "/tmp/gcp-sa.json";
  fs.writeFileSync(path, json);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
  try {
    const { project_id } = JSON.parse(json);
    if (project_id) process.env.GOOGLE_CLOUD_PROJECT = project_id;
  } catch {}
  console.log("[google-creds] Wrote", path, "and set GOOGLE_APPLICATION_CREDENTIALS");
})();