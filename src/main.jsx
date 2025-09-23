import React from "react";
import { createRoot } from "react-dom/client";
import Site from "../index.tsx"; // this is your canvas file at the repo root

const root = createRoot(document.getElementById("root"));
root.render(<Site />);
