import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
window.Buffer = Buffer;
import App from "./App.tsx";

/* Solana Wallet Adapter UI Styles */
import "@solana/wallet-adapter-react-ui/styles.css";

/* Global Web3 Dark Theme Styles */
import "./index.css"; // <-- Create this (dark theme root styles)

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
