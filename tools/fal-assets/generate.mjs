import { fal } from "@fal-ai/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const model = process.env.FAL_MODEL || "fal-ai/gpt-image-1.5";
const prompt = process.argv.slice(2).join(" ").trim();
if (!process.env.FAL_KEY) {
  console.error("FAL_KEY is missing. Configure it in your local environment.");
  process.exit(1);
}
if (!prompt) {
  console.error('Usage: npm run generate -- "Describe a TD2 asset"');
  process.exit(1);
}
const result = await fal.subscribe(model, { input: { prompt } });
const images = result.data?.images;
if (!Array.isArray(images) || !images.length) {
  throw new Error("Model did not return images; check the selected model output schema.");
}
const outDir = path.resolve("generated");
await mkdir(outDir, { recursive: true });
const manifest = {
  model, prompt, requestId: result.requestId,
  images: images.map((item) => ({ url: item.url, width: item.width, height: item.height }))
};
const name = `asset-${Date.now()}`;
await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(manifest, null, 2) + "\n");
for (const [index, item] of images.entries()) {
  const response = await fetch(item.url);
  if (!response.ok) throw new Error(`Image download failed: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  await writeFile(path.join(outDir, `${name}-${index + 1}.${extension}`), Buffer.from(await response.arrayBuffer()));
}
console.log(`Saved ${images.length} image(s) and manifest to ${outDir}`);
