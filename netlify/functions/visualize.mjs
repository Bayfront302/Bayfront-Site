import { randomUUID } from "node:crypto";
import { isEnabled, response, reserveQuota, releaseQuota, signJob, store, STYLES, validJobId } from "./_visualize-common.mjs";

const MAX_INPUT_BYTES = 3_200_000;
const RESULT_LIFETIME_MS = 28 * 60 * 60 * 1000;

function validImage(bytes, type) {
  const b = new Uint8Array(bytes);
  const jpg = b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.length > 8 && b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71;
  const webp = b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  return (type === "image/jpeg" && jpg) || (type === "image/png" && png) || (type === "image/webp" && webp);
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.searchParams.has("availability")) {
    return response({ available: isEnabled() });
  }

  if (request.method === "GET") {
    const id = url.searchParams.get("job");
    if (!validJobId(id)) return response({ error: "Invalid preview link." }, 400);
    try {
      const s = store();
      const job = await s.get("job/" + id, { type: "json" });
      if (!job || Date.now() - job.createdAt > RESULT_LIFETIME_MS) {
        return response({ error: "This preview has expired." }, 404);
      }
      if (url.searchParams.has("image") || url.searchParams.has("download")) {
        if (job.status !== "ready") return response({ error: "Your preview is not ready yet." }, 409);
        const image = await s.get("output/" + id, { type: "arrayBuffer" });
        if (!image) return response({ error: "Preview image not found." }, 404);
        return new Response(image, {
          headers: {
            "Content-Type": "image/jpeg", "Content-Security-Policy": "sandbox",
            "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
            "Content-Disposition": url.searchParams.has("download") ? 'attachment; filename="Bayfront-Holiday-Lights-Preview.jpg"' : 'inline; filename="Bayfront-Holiday-Lights-Preview.jpg"'
          }
        });
      }
      const status = job.status === "ready" ? "ready" : job.status === "error" ? "error" : "working";
      return response({ status, message: status === "error" ? (job.message || "We could not generate that preview. Please try again later.") : undefined,
        imageUrl: status === "ready" ? "/.netlify/functions/visualize?job=" + id + "&image=1" : undefined,
        downloadUrl: status === "ready" ? "/.netlify/functions/visualize?job=" + id + "&download=1" : undefined
      });
    } catch (err) {
      console.error("Visualizer lookup failed:", err?.message);
      return response({ error: "The preview service is temporarily unavailable." }, 503);
    }
  }

  if (request.method !== "POST") return response({ error: "Method not supported." }, 405);
  if (!isEnabled()) return response({ error: "The free holiday-light preview is not open yet. Please request a free installation estimate." }, 503);

  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return response({ error: "Please use the form on our website." }, 403);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 4_000_000) return response({ error: "That photo is too large. Please choose a smaller image." }, 413);

  let form;
  try { form = await request.formData(); }
  catch { return response({ error: "We couldn't read that photo. Please try another." }, 400); }

  const image = form.get("image");
  const style = form.get("style");
  if (!image || typeof image.arrayBuffer !== "function" || !STYLES[style]) {
    return response({ error: "Please upload a house photo and select a lighting style." }, 400);
  }
  if (form.get("consent") !== "yes") return response({ error: "Please confirm you have permission to use this photo." }, 400);
  if (image.size < 1000 || image.size > MAX_INPUT_BYTES || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    return response({ error: "Upload a JPG, PNG, or WebP photo under 3 MB." }, 400);
  }
  const bytes = await image.arrayBuffer();
  if (!validImage(bytes, image.type)) return response({ error: "The selected file is not a valid house photo." }, 400);

  const id = randomUUID();
  let s;
  let quota;
  try {
    s = store();
    quota = await reserveQuota(s, context.ip || request.headers.get("x-nf-client-connection-ip"), id);
    if (quota.error) return response({ error: quota.error }, 429);
    const job = { id, style, mime: image.type, status: "queued", createdAt: Date.now(), ipSlot: quota.ipSlot, dailySlot: quota.dailySlot };
    await s.setJSON("job/" + id, job);
    await s.set("input/" + id, new Blob([bytes], { type: image.type }));
    const endpoint = new URL("/.netlify/functions/visualize-worker-background", request.url);
    const invoke = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, signature: signJob(id) }),
      signal: AbortSignal.timeout(12000)
    });
    if (invoke.status !== 202) throw new Error("Background worker rejected request: " + invoke.status);
    return response({ id, status: "working" }, 202);
  } catch (err) {
    console.error("Could not queue holiday preview:", err?.message);
    if (s) {
      await Promise.allSettled([s.delete("input/" + id), s.delete("job/" + id), quota?.ipSlot && releaseQuota(s, quota)]);
    }
    return response({ error: "The visualizer is busy right now. Please try again in a few minutes." }, 503);
  }
}
