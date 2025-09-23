import React from "react";
import { createRoot } from "react-dom/client";
import Site from "./Site.jsx"; // <- make sure the file exists with this exact name/casing
// Optional global styles if you have them:
// import "./index.css";

const el = document.getElementById("root");
if (!el) {
  throw new Error('Missing <div id="root"></div> in index.html');
}

const root = createRoot(el);
root.render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>
);
