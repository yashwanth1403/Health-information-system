import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const requireFromBackend = createRequire(
  new URL("../backend/package.json", import.meta.url)
);
const { Client } = requireFromBackend("@opensearch-project/opensearch");

// Resolve project directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ node: "http://localhost:9200" });

// Paths
const indexName = "health_docs";
const indexConfigPath = path.join(__dirname, "index-config.json");
const ndjsonPath = path.join(__dirname, "../datasets/health_docs.ndjson");

async function reindex() {
  console.log(`🔄 Reindexing OpenSearch Index: ${indexName}`);

  // 1. Delete index if exists
  try {
    await client.indices.delete({ index: indexName });
    console.log(`🗑 Deleted existing index "${indexName}".`);
  } catch (e) {
    console.log(`ℹ No previous index found. Skipping delete.`);
  }

  // 2. Create new index using index-config.json
  const indexConfig = JSON.parse(fs.readFileSync(indexConfigPath, "utf8"));

  await client.indices.create({
    index: indexName,
    body: indexConfig,
  });

  console.log(`📁 Created index "${indexName}" with mappings + analyzers.`);

  // 3. Bulk upload NDJSON
  const ndjsonBody = fs.readFileSync(ndjsonPath, "utf8");

  const { body } = await client.bulk({
    index: indexName,
    refresh: true,
    body: ndjsonBody
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line)),
  });

  if (body.errors) {
    console.error("❌ Some documents failed to index!", body);
  } else {
    console.log(`📥 Successfully indexed ${body.items.length} documents.`);
  }

  console.log("✅ Reindex completed!");
}

reindex().catch(console.error);
