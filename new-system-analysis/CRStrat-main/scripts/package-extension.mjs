import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "extension");
const outFile = path.join(root, "extension-dist.zip");

if (!fs.existsSync(src)) {
  console.error("Missing extension/ directory");
  process.exit(1);
}
const output = fs.createWriteStream(outFile);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => console.log(`Packaged ${archive.pointer()} bytes -> ${outFile}`));
archive.on("error", (err) => { throw err; });

archive.pipe(output);
archive.directory(src, false);
await archive.finalize();