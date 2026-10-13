import { isEnabled, releaseQuota, signJob, store, STYLES, validSignature } from "./_visualize-common.mjs";

// Netlify background function: image editing may exceed the 60-second synchronous limit.
export const config = { background: true };

export default async function worker(request) {
  if (request.method !== "POST" || !isEnabled()) return;
  let input;
  try { input = await request.json(); } catch { return; }
  const id = input?.id;
  if (!validSignature(id, input?.signature)) return;

  const s = store();
  const key = "job/" + id;
  const current = await s.getWithMetadata(key, { type: "json" });
  if (!current?.data || current.data.status !== "queued") return;

  // Conditional update prevents retried/replayed invocations from billing twice.
  const job = { ...current.data, status: "processing" };
  const claimed = await s.setJSON(key, job, { onlyIfMatch: current.etag });
  if (!claimed.modified) return;

  try {
    const bytes = await s.get("input/" + id, { type: "arrayBuffer" });
    if (!bytes) throw new Error("Missing input photo");
    const ext = job.mime === "image/png" ? "png" : job.mime === "image/webp" ? "webp" : "jpg";
    const data = new FormData();
    data.append("model", process.env.VISUALIZER_IMAGE_MODEL || "gpt-image-1.5");
    data.append("image", new Blob([bytes], { type: job.mime }), "customer-home." + ext);
    data.append("size", "auto");
    data.append("quality", "medium");
    data.append("output_format", "jpeg");
    data.append("output_compression", "78");
    data.append("n", "1");
    data.append("prompt", [
      "Edit this uploaded photograph of a real house to show a realistic, professionally installed Christmas lighting design.",
      "The house in the result MUST be the same actual house: preserve its architecture, layout, roof shape, stone/brick, windows, doors, landscaping and camera angle.",
      "Do not invent rooflines or alter the structure. Do not add text, logos, people, watermarks, signs, or banners.",
      "Keep the image photorealistic and premium, with a believable blue-hour/dusk ambiance.",
      "Lighting treatment: " + STYLES[job.style],
      "Use practical installed lighting on actual existing edges and trees, not fantasy lighting. Create one polished preview."
    ].join(" "));

    const api = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY },
      body: data,
      signal: AbortSignal.timeout(7 * 60 * 1000)
    });
    const result = await api.json().catch(() => null);
    if (!api.ok) {
      console.error("OpenAI image API response:", api.status, result?.error?.code || "unknown");
      throw new Error("AI image edit failed with status " + api.status);
    }
    const image64 = result?.data?.[0]?.b64_json;
    if (typeof image64 !== "string" || image64.length < 1000) throw new Error("No image returned");
    const imageBytes = Buffer.from(image64, "base64");
    if (imageBytes.length < 1000 || imageBytes.length > 12_000_000) throw new Error("Invalid generated image");
    await s.set("output/" + id, new Blob([imageBytes], { type: "image/jpeg" }));
    await s.setJSON(key, { ...job, status: "ready", finishedAt: Date.now() });
  } catch (err) {
    console.error("Holiday preview generation failed:", err?.message);
    try {
      await s.setJSON(key, {
        ...job, status: "error", finishedAt: Date.now(),
        message: "We couldn't generate this preview. Please choose a clearer exterior photo or request an estimate."
      });
      await releaseQuota(s, job);
    } catch (writeError) {
      console.error("Visualizer status update failed:", writeError?.message);
    }
  } finally {
    // Original customer photos are deleted as soon as image processing finishes.
    await s.delete("input/" + id).catch(err => console.error("Visualizer image cleanup failed:", err?.message));
  }
}
