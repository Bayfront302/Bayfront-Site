import React from "react";
import { createRoot } from "react-dom/client";
import Site from "../App.jsx"; // uses your existing canvas code file at repo root

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
root.render(<Site />);
