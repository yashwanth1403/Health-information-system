import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, "../datasets/json");
const outputFile = path.join(__dirname, "../datasets/health_docs.ndjson");

if (!fs.existsSync(inputDir)) {
  throw new Error(`Input directory not found: ${inputDir}`);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const files = fs.readdirSync(inputDir).filter((file) => file.endsWith(".json"));

const writeStream = fs.createWriteStream(outputFile);

files.forEach((file) => {
  const jsonPath = path.join(inputDir, file);
  const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Index command line
  const indexCmd = {
    index: {
      _index: "health_docs",
      _id: content.id,
    },
  };

  writeStream.write(JSON.stringify(indexCmd) + "\n");
  writeStream.write(JSON.stringify(content) + "\n");
});

writeStream.end(() =>
  console.log("DONE ➜ health_docs.ndjson created successfully 🚀")
);
