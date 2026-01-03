import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const jpgPath = path.join(projectRoot, "public", "branding", "vietnam-dongson.jpg");
const outPath = path.join(projectRoot, "public", "branding", "favicon.svg");

if (!fs.existsSync(jpgPath)) {
  console.error("Missing file:", jpgPath);
  process.exit(1);
}

const base64 = fs.readFileSync(jpgPath).toString("base64");

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">',
  "  <defs>",
  "    <clipPath id=\"clip\">",
  "      <circle cx=\"32\" cy=\"32\" r=\"31\" />",
  "    </clipPath>",
  "  </defs>",
  "  <circle cx=\"32\" cy=\"32\" r=\"31\" fill=\"#fff\" />",
  "  <g clip-path=\"url(#clip)\">",
  `    <image href="data:image/jpeg;base64,${base64}" x="0" y="0" width="64" height="64" preserveAspectRatio="xMidYMid slice" />`,
  "  </g>",
  "  <circle cx=\"32\" cy=\"32\" r=\"31\" fill=\"none\" stroke=\"rgba(0,0,0,0.18)\" stroke-width=\"2\" />",
  "</svg>",
  "",
].join("\n");

fs.writeFileSync(outPath, svg);
