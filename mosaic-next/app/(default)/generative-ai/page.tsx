import fs from "fs";
import path from "path";
import { Suspense } from "react";

import GenerativeAiClient from "./generative-ai-client";

export const metadata = {
  title: "Generative AI & Gemini Telemetry — Admin Lens",
  description: "Comprehensive executive dashboard monitoring Generative AI, Gemini, and NotebookLM adoption, knowledge sources, and autonomous agents across Google Workspace.",
};

export default function GenerativeAiPage() {
  const dataPath = path.join(process.cwd(), "data", "generative_ai_data.json");
  let data = null;

  if (fs.existsSync(dataPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    } catch (err) {
      console.error("Error reading generative_ai_data.json:", err);
    }
  }

  return (
    <Suspense fallback={<div className="p-8 text-indigo-500 font-medium animate-pulse">Loading Generative AI Telemetry...</div>}>
      <GenerativeAiClient initialData={data} />
    </Suspense>
  );
}
