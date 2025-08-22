import "../bootstrap/google-creds";
import vision from "@google-cloud/vision";

(async () => {
  const client = new vision.ImageAnnotatorClient();
  const [res] = await client.labelDetection({
    image: { source: { imageUri: "https://storage.googleapis.com/cloud-samples-data/vision/label/wakeupcat.jpg" } },
  });
  const labels = (res.labelAnnotations || []).map(x => x.description);
  if (!labels.length) throw new Error("No labels");
  console.log("Vision OK. Labels:", labels.slice(0, 5));
})().catch(e => {
  console.error("Vision test failed:", e.message);
  process.exit(1);
});