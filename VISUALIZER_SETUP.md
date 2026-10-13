# Bayfront Lighting – AI Holiday Lights Visualizer

This feature is staged behind a server-side launch switch. Until configured, visitors see an "opening soon" message and can still request a standard estimate.

## Launch checklist

1. Merge the visualizer PR into main. Netlify will install the new `@netlify/blobs` dependency during the next build.
2. In **Netlify → Your site → Project configuration → Environment variables**, add:
   - `OPENAI_API_KEY` = your OpenAI API project key (secret; Functions runtime only).
   - `VISUALIZER_ENABLED` = `true` when ready to accept customer previews.
   - `VISUALIZER_DAILY_LIMIT` = `20` to limit all generated images each UTC day (optional; defaults to 20, maximum accepted value 100).
   - `VISUALIZER_IMAGE_MODEL` = `gpt-image-1.5` (optional; defaults to this).
   - `VISUALIZER_SECRET` = a securely generated random secret (recommended; optional; otherwise the API key is used for HMAC signatures).
3. Set a sensible **OpenAI API project budget and usage alerts**. ChatGPT Plus/Pro does not automatically provide API credits. Each completed generation is billed through the API.
4. Redeploy the site after editing Netlify environment variables. Set `VISUALIZER_ENABLED` to `false` to immediately disable new generations (redeploy to apply changes).
5. Test with a photo of a house you have permission to use. Verify the AI result, download button, mobile layout and estimate CTA before buying ads.

**Never paste your API key in GitHub, client JavaScript, public environment variables (such as `VITE_*`), or customer-facing HTML.**

## How it works

- Visitors upload a house photo, pick warm white, traditional red/green, or premium full-property lighting and consent to temporary processing.
- The browser downsizes the image. A Netlify Function validates photo type and size, accepts the work, and returns a private random job identifier. This is not an account/auth system, so anyone given the job link can view the preview while it exists. Do not share the link publicly.
- The background function edits the uploaded house photo with OpenAI's image-edit API. It produces an AI illustration, not a guaranteed installation design.
- The function removes the original photo immediately after generating (or failing). Temporary results expire after 28 hours and a scheduled cleanup runs every 4 hours, so orphaned content is removed later. No house photos are added to the marketing gallery or the contact database.
- A local browser flag limits visitors to one complimentary result per device. Server-side atomic quota reservations limit use to three attempts per public IP per UTC day and the site's daily cap; IP addresses are hashed with a secret, not stored in plaintext.
- An expired job identifier does not give access to old results. Successful previews are never included in the normal Netlify estimate form.
- The original estimate form, lead tracking script, and existing homepage sections are not replaced.

## Operational cautions

- Quotas are a **cost-control guardrail, not bot-proof authentication**. Shared Wi-Fi users may share the same IP limit. Watch OpenAI API usage, and add CAPTCHA / managed anti-bot controls for a large public campaign.
- OpenAI image edits can subtly change a property's details, despite prompts requesting preservation. Clearly label previews illustrative and review before making promises.
- Netlify background functions need to be enabled on your plan; they support long-running generation. Check **Netlify → Logs → Functions** if jobs do not progress.
- This feature needs an OpenAI API key and Netlify build/runtime configuration; the code alone cannot generate live images.
- The API budget should cover expected traffic. Test with a small daily limit (for example, 5) before increasing it.
- Access to generated preview images is controlled by long random identifiers (unguessable URLs), not by authenticated accounts. Avoid including addresses or personal information inside photographs when testing.
