import React, { useEffect, useRef, useState } from "react";
import "./visualizer.css";

const ENDPOINT = "/.netlify/functions/visualize";
const USED_KEY = "bayfront-visualizer-used-v1";
const PENDING_KEY = "bayfront-visualizer-pending-v1";

const STYLES = [
  { id: "classic", title: "Classic warm white", note: "Refined, timeless rooflines and soft tree accents", number: "01" },
  { id: "festive", title: "Traditional holiday", note: "Red-and-green rooflines with a warm festive glow", number: "02" },
  { id: "signature", title: "Full property luxury", note: "An elevated design with trees, rooflines and wreaths", number: "03" }
];

async function resizeForUpload(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 14 * 1024 * 1024) {
    throw new Error("Please use a JPG, PNG or WebP house photo smaller than 14 MB.");
  }
  let image;
  try { image = await createImageBitmap(file); }
  catch { throw new Error("We couldn't open that image. Try another exterior photo."); }
  try {
    if (image.width < 400 || image.height < 300) throw new Error("Please choose a clearer photo at least 400 × 300 pixels.");
    const max = 1700;
    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing isn't available on this device.");
    ctx.fillStyle = "#152022";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.80));
    if (!blob || blob.size > 3_200_000) throw new Error("This photo is still too large. Please try a different one.");
    return blob;
  } finally { image.close(); }
}

export default function Visualizer() {
  const [available, setAvailable] = useState(null);
  const [file, setFile] = useState(null);
  const [beforeUrl, setBeforeUrl] = useState("");
  const [style, setStyle] = useState("classic");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle");
  const [jobId, setJobId] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [used, setUsed] = useState(() => { try { return localStorage.getItem(USED_KEY) === "1"; } catch { return false; } });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetch(ENDPOINT + "?availability=1", { cache: "no-store" })
      .then(r => r.json()).then(data => { if (isMounted.current) setAvailable(Boolean(data.available)); })
      .catch(() => { if (isMounted.current) setAvailable(false); });
    try {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (pending && /^[0-9a-f-]{36}$/.test(pending)) { setJobId(pending); setStatus("working"); }
    } catch {}
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!jobId || status !== "working") return;
    let stopped = false;
    const started = Date.now();
    const poll = async () => {
      if (stopped) return;
      try {
        const r = await fetch(ENDPOINT + "?job=" + encodeURIComponent(jobId), { cache: "no-store" });
        const data = await r.json();
        if (stopped) return;
        if (data.status === "ready") {
          setResultUrl(data.imageUrl);
          setDownloadUrl(data.downloadUrl);
          setStatus("ready");
          setUsed(true);
          try {
            localStorage.setItem(USED_KEY, "1");
            sessionStorage.removeItem(PENDING_KEY);
            const chosen = STYLES.find(item => item.id === style)?.title || "Custom holiday lighting";
            sessionStorage.setItem("bayfront-visualizer-style", chosen);
            window.dispatchEvent(new CustomEvent("bayfront-visualizer-ready", { detail: chosen }));
          } catch {}
        } else if (data.status === "error" || !r.ok) {
          setError(data.message || data.error || "We couldn't complete the preview. Please try again.");
          setStatus("error");
          try { sessionStorage.removeItem(PENDING_KEY); } catch {}
        } else if (Date.now() - started > 9 * 60 * 1000) {
          setError("This preview is taking longer than expected. Please refresh the page in a few minutes.");
          setStatus("error");
        }
      } catch {
        if (Date.now() - started > 9 * 60 * 1000 && !stopped) {
          setError("We lost contact with the preview service. Refresh to check its progress.");
          setStatus("error");
        }
      }
    };
    poll();
    const interval = window.setInterval(poll, 3500);
    return () => { stopped = true; window.clearInterval(interval); };
  }, [jobId, status]);

  useEffect(() => () => { if (beforeUrl) URL.revokeObjectURL(beforeUrl); }, [beforeUrl]);

  function chooseFile(e) {
    const next = e.target.files?.[0];
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type) || next.size > 14 * 1024 * 1024) {
      setError("Please choose a JPG, PNG or WebP photo under 14 MB.");
      e.target.value = "";
      return;
    }
    setFile(next);
    setBeforeUrl(URL.createObjectURL(next));
    setResultUrl("");
    setError("");
    setStatus("idle");
  }

  async function generate(e) {
    e.preventDefault();
    if (!available || !file || !consent || used || status === "working" || status === "uploading") return;
    setError("");
    setStatus("uploading");
    try {
      const prepared = await resizeForUpload(file);
      const data = new FormData();
      data.append("image", prepared, "home-exterior.jpg");
      data.append("style", style);
      data.append("consent", "yes");
      const r = await fetch(ENDPOINT, { method: "POST", body: data });
      const result = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(result.error || "Couldn't start your preview. Please try again.");
      setJobId(result.id);
      setStatus("working");
      try { sessionStorage.setItem(PENDING_KEY, result.id); } catch {}
    } catch (err) {
      setError(err.message || "We couldn't create that preview.");
      setStatus("error");
    }
  }

  return <section className="bf-visualizer" id="visualizer" aria-labelledby="visualizer-heading">
    <div className="bf-container">
      <div className="bf-visualizer__top">
        <div>
          <p className="bf-eyebrow">YOUR HOME, BEAUTIFULLY LIT</p>
          <h2 id="visualizer-heading">See the magic <em>before it happens.</em></h2>
        </div>
        <p>Upload a picture of your home, choose your favorite lighting style and discover what the holidays could look like.</p>
      </div>

      <div className="bf-visualizer__layout">
        <form className="bf-visualizer__form" onSubmit={generate}>
          <div className="bf-visualizer__step"><span>01</span><div><h3>Add your home</h3><p>A clear daytime photo of the front exterior works best.</p></div></div>
          <label className={"bf-visualizer__upload" + (beforeUrl ? " bf-visualizer__upload--selected" : "")}>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} disabled={used || status === "working" || status === "uploading"} aria-label="Upload a photo of your home's exterior" />
            <span className="bf-visualizer__upload-icon" aria-hidden="true">+</span>
            <strong>{file?.name || "Choose a house photo"}</strong>
            <small>JPG, PNG or WebP · Up to 14 MB</small>
          </label>

          <div className="bf-visualizer__step bf-visualizer__step--styles"><span>02</span><div><h3>Choose your look</h3><p>One complimentary AI preview per device.</p></div></div>
          <div className="bf-visualizer__styles" role="radiogroup" aria-label="Holiday lighting style">
            {STYLES.map(item => <label key={item.id} className={"bf-visualizer__style" + (style === item.id ? " bf-visualizer__style--selected" : "")}>
              <input type="radio" name="lighting-style" value={item.id} checked={style === item.id} onChange={() => setStyle(item.id)} disabled={used || status === "working" || status === "uploading"} />
              <span className="bf-visualizer__style-num">{item.number}</span>
              <span className="bf-visualizer__style-copy"><strong>{item.title}</strong><small>{item.note}</small></span>
              <span aria-hidden="true" className="bf-visualizer__radio" />
            </label>)}
          </div>

          <label className="bf-visualizer__consent">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} disabled={used || status === "working" || status === "uploading"} />
            <span>I own this photo or have permission to use it, and agree to temporary AI processing.</span>
          </label>

          {error && <p className="bf-visualizer__error" role="alert">{error}</p>}
          {available === false && <p className="bf-visualizer__offline">Free previews are being prepared. Our installation estimate service is open now.</p>}
          <button className="bf-visualizer__generate" type="submit" disabled={!available || !file || !consent || used || status === "uploading" || status === "working"}>
            {status === "uploading" ? "Preparing your photo…" : status === "working" ? "Designing your lights…" : used ? "Your free preview is complete" : available === false ? "Preview coming soon" : "Visualize my home  ↗"}
          </button>
          <p className="bf-visualizer__fineprint">No account required. This is an AI illustration, not an installation quote. Uploaded photos are used for processing and automatically deleted; generated previews are temporarily available for download.</p>
        </form>

        <div className="bf-visualizer__showcase">
          {beforeUrl ? <div className="bf-visualizer__compare">
            <figure><img src={beforeUrl} alt="Original photograph of your home" /><figcaption>YOUR HOME / BEFORE</figcaption></figure>
            {resultUrl ? <figure><img src={resultUrl} alt={"AI illustration of your home with " + STYLES.find(x => x.id === style)?.title + " holiday lights"} /><figcaption>YOUR LIGHTING PREVIEW / AFTER</figcaption></figure>
              : <div className="bf-visualizer__pending"><span aria-hidden="true">✳</span><strong>{status === "working" || status === "uploading" ? "Creating your holiday look" : "Your holiday lighting preview"}</strong><p>{status === "working" ? "Our AI is carefully adding lighting to your home's rooflines and landscaping. This may take a couple of minutes." : "Choose your style and create your complimentary preview."}</p></div>}
          </div> : resultUrl ? <figure className="bf-visualizer__solo"><img src={resultUrl} alt="Your AI holiday lighting preview" /><figcaption>YOUR LIGHTING PREVIEW</figcaption></figure> : <div className="bf-visualizer__placeholder">
            <span className="bf-visualizer__placeholder-mark" aria-hidden="true">✳</span>
            <p>YOUR HOME, REIMAGINED</p>
            <h3>A little light.<br /><em>A lot of wonder.</em></h3>
            <span className="bf-visualizer__placeholder-caption">YOUR PERSONAL HOLIDAY LIGHTING PREVIEW</span>
          </div>}
          <div className="bf-visualizer__showcase-bottom">
            <span>{status === "ready" ? "YOUR PREVIEW IS READY" : "THE BAYFRONT DESIGN EXPERIENCE"}</span>
            {resultUrl && downloadUrl ? <a href={downloadUrl} className="bf-visualizer__download">Download preview ↓</a> : <span>DESIGNED FOR YOUR HOME</span>}
          </div>
          {resultUrl && <div className="bf-visualizer__next"><h3>Love the look?</h3><p>Our team can tailor the design to your property and provide a custom installation estimate. Projects start at $1,000.</p><a href="#estimate">Get my installation estimate ↗</a></div>}
        </div>
      </div>
    </div>
  </section>;
}
