import React from "react"
import { createRoot } from "react-dom/client"
import FreshysSite from "./web/FreshysSite.web.tsx"
createRoot(document.getElementById("root")).render(React.createElement(FreshysSite, { site: "live", language: "hr", style: { width: "100%" } }))
