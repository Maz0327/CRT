import fetch from "node-fetch";

const base = process.env.API_BASE || "http://localhost:5001/api";
const userId = process.env.TEST_USER_ID || "00000000-0000-0000-0000-000000000001";
const projectId = process.env.TEST_PROJECT_ID || "00000000-0000-0000-0000-000000000002";

async function main() {
  const headers: any = { "content-type": "application/json", "x-user-id": userId };
  const created = await fetch(`${base}/signals`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      projectId,
      title: "Test Signal",
      summary: "Short summary for test",
      receipts: [],
      origin: "upload",
      source_tag: "Upload"
    }),
  }).then(r => r.json());

  if (created.error) throw new Error("Create failed: " + created.error);
  console.log("CREATE id=", created.id);

  const listed = await fetch(`${base}/signals?projectId=${projectId}`, { headers }).then(r => r.json());
  if (!Array.isArray(listed)) throw new Error("List failed");
  console.log("LIST count=", listed.length);

  const confirmed = await fetch(`${base}/signals/${created.id}/confirm`, { method: "POST", headers }).then(r => r.json());
  if (confirmed.error) throw new Error("Confirm failed: " + confirmed.error);
  console.log("CONFIRM status=", confirmed.status);
}
main().catch(e => {
  console.error(e);
  process.exit(1);
});