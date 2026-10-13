import { createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

export const STYLES = {
  classic: "Elegant warm-white professional C9 bulbs tracing the rooflines, with understated warm-white tree and landscape accents.",
  festive: "Tasteful classic red and green C9 roofline bulbs, warm golden mini lights on landscape trees, and a natural wreath with a red bow.",
  signature: "A premium full-property lighting concept: crisp warm-white roofline C9 lights, beautifully wrapped trees, refined architectural accents, and graceful wreaths."
};

export function isEnabled() {
  return process.env.VISUALIZER_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY);
}

export function store() {
  // Strong consistency + conditional writes are necessary to limit paid requests.
  return getStore({ name: "bayfront-visualizer", consistency: "strong" });
}

export function response(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

const secret = () => process.env.VISUALIZER_SECRET || process.env.OPENAI_API_KEY || "";

export function signJob(id) {
  return createHmac("sha256", secret()).update("bayfront-preview:" + id).digest("hex");
}

export function validSignature(id, supplied) {
  if (!/^[0-9a-f-]{36}$/.test(id || "") || typeof supplied !== "string" || !/^[0-9a-f]{64}$/.test(supplied)) return false;
  return timingSafeEqual(Buffer.from(signJob(id), "hex"), Buffer.from(supplied, "hex"));
}

export async function reserveQuota(s, ip, jobId) {
  if (!ip) throw new Error("Client address unavailable");
  const date = new Date().toISOString().slice(0, 10);
  const hashedIP = createHmac("sha256", secret()).update("ip:" + ip).digest("hex");
  const ipBase = "limit/ip/" + date + "/" + hashedIP;
  const dailyBase = "limit/day/" + date + "/";
  const maxDaily = Math.min(100, Math.max(1, Number(process.env.VISUALIZER_DAILY_LIMIT) || 20));
  let ipSlot = null;
  for (let i = 1; i <= 3; i++) {
    const key = ipBase + "/" + i;
    const result = await s.setJSON(key, { jobId, createdAt: Date.now() }, { onlyIfNew: true });
    if (result.modified) { ipSlot = key; break; }
  }
  if (!ipSlot) return { error: "You've reached the preview limit for your network today. Please request an estimate instead." };
  for (let i = 1; i <= maxDaily; i++) {
    const key = dailyBase + i;
    try {
      const result = await s.setJSON(key, { jobId, createdAt: Date.now() }, { onlyIfNew: true });
      if (result.modified) return { ipSlot, dailySlot: key };
    } catch (err) {
      await s.delete(ipSlot);
      throw err;
    }
  }
  await s.delete(ipSlot);
  return { error: "Today's complimentary previews are fully booked. Please check back tomorrow or request an estimate." };
}

export async function releaseQuota(s, job) {
  // Refund unsuccessful jobs. Only store quota slot keys, never raw client IPs.
  await Promise.allSettled([job?.ipSlot && s.delete(job.ipSlot), job?.dailySlot && s.delete(job.dailySlot)]);
}

export const validJobId = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
