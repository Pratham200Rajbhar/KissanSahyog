"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Layers3, Workflow, Database, Bot, Satellite } from "lucide-react";

type PanelId = "architecture" | "models" | "pipeline";

interface PanelConfig {
  id: PanelId;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  highlights: string[];
  stack: string[];
}

const PANELS: PanelConfig[] = [
  {
    id: "architecture",
    title: "Architecture Lens",
    subtitle: "How the system is layered from UI to intelligence engines.",
    icon: Layers3,
    highlights: [
      "Next.js client modules coordinate feature flows through unified API routes.",
      "FastAPI routers and services isolate inference logic per domain capability.",
      "Supabase stores prediction histories for analysis and reporting.",
      "Shared location context synchronizes environmental signals across pages.",
    ],
    stack: ["Client Layer", "Inference Layer", "Storage Layer", "Intelligence Layer"],
  },
  {
    id: "models",
    title: "Model Registry Lens",
    subtitle: "Exact classes used in production and their output contracts.",
    icon: BrainCircuit,
    highlights: [
      "Yield: Pipeline with RandomForestRegressor and preprocessor chain.",
      "Crop: RandomForestClassifier over soil-weather input vectors.",
      "Fertilizer: XGBClassifier over normalized agronomic signals.",
      "Disease: Hybrid ResNet50 + DenseNet121 + SE attention fusion.",
    ],
    stack: ["Tabular ML", "Gradient Boosting", "Deep Vision", "LLM Explanations"],
  },
  {
    id: "pipeline",
    title: "Data Pipeline Lens",
    subtitle: "How raw environmental data becomes actionable field guidance.",
    icon: Workflow,
    highlights: [
      "GPS coordinates are reverse-geocoded into region context.",
      "NASA POWER, SoilGrids, and Open-Meteo signals are fused.",
      "Inference services execute model predictions in bounded runtime.",
      "Gemini explanations convert outputs into practical guidance.",
    ],
    stack: ["Geo Sync", "Feature Assembly", "Inference", "Advice Delivery"],
  },
];

export default function LandingInteractivePanel() {
  const [active, setActive] = useState<PanelId>("architecture");
  const current = PANELS.find((panel) => panel.id === active) ?? PANELS[0];
  const CurrentIcon = current.icon;

  return (
    <section className="surface-panel p-5 sm:p-7 rounded-[1.6rem] overflow-hidden">
      <div className="flex flex-wrap gap-2 mb-5">
        {PANELS.map((panel) => {
          const isActive = panel.id === active;
          return (
            <button
              key={panel.id}
              onClick={() => setActive(panel.id)}
              className={[
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                isActive
                  ? "bg-primary text-on-primary-container shadow-[0_8px_18px_rgba(78,222,163,0.2)]"
                  : "bg-white/5 text-slate-300 hover:bg-white/10",
              ].join(" ")}
            >
              {panel.title}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3">
              <CurrentIcon className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-xl font-bold mb-2">{current.title}</h3>
            <p className="text-sm text-on-surface-variant mb-4">{current.subtitle}</p>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              {current.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/6 to-white/2 p-5">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Active Stack Blocks</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {current.stack.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-on-surface-variant"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-on-surface-variant">
              The platform is designed as a composable AI system: each module can evolve independently while
              preserving stable API contracts and shared context semantics.
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest font-bold">
              <Database className="w-3.5 h-3.5" />
              Structured data contracts
              <Bot className="w-3.5 h-3.5 ml-2" />
              Context-aware explanations
              <Satellite className="w-3.5 h-3.5 ml-2" />
              Remote sensing integration
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
