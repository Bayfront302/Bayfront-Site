import React from "react";
import { createRoot } from "react-dom/client";
import Site from "./Site.jsx";
import "./index.css"; // Tailwind + any global styles

const el = document.getElementById("root");
if (!el) throw new Error('Missing <div id="root"></div> in index.html');

createRoot(el).render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>
);
