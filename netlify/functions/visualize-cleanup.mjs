import { store } from "../shared/visualize-common.mjs";

// Netlify runs this every four hours to remove temporary photos, preview images,
// expired jobs, and old rate-limit records.
export const config = { schedule: "15 */4 * * *" };

export default async function cleanup() {
  const s = store();
  const now = Date.now();
  const lifetime = 28 * 60 * 60 * 1000;
  let removed = 0;

  for await (const page of s.list({ prefix: "job/", paginate: true })) {
    for (const entry of page.blobs) {
      const job = await s.get(entry.key, { type: "json" });
      if (!job || !Number.isFinite(job.createdAt) || now - job.createdAt > lifetime) {
        const id = entry.key.slice(4);
        await Promise.allSettled([
          s.delete("input/" + id),
          s.delete("output/" + id),
          s.delete(entry.key)
        ]);
        removed++;
      }
    }
  }

  const cutoff = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  for (const prefix of ["limit/ip/", "limit/day/"]) {
    for await (const page of s.list({ prefix, paginate: true })) {
      for (const entry of page.blobs) {
        const date = entry.key.slice(prefix.length, prefix.length + 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date < cutoff) {
          await s.delete(entry.key);
          removed++;
        }
      }
    }
  }

  console.log("Visualizer cleanup removed", removed, "temporary records");
}
