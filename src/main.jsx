import React from "react";
import { createRoot } from "react-dom/client";
import Site from "./Site.jsx";   // ✅ Import your Site component

const root = createRoot(document.getElementById("root"));
root.render(<Site />);
