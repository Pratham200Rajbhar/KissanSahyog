"use client";

import { useTranslations } from "next-intl";
import { Cpu, Database, Satellite, BrainCircuit, Network, Layers } from "lucide-react";

export default function TechSection() {
  const t = useTranslations("landing");

  const techs = [
    {
      icon: Network,
      name: t("model_disease_name"),
      tech: t("model_disease_tech"),
      color: "from-primary/20 via-primary/10 to-transparent",
      borderColor: "border-primary/20",
    },
    {
      icon: BrainCircuit,
      name: t("model_yield_name"),
      tech: t("model_yield_tech"),
      color: "from-tertiary/20 via-tertiary/10 to-transparent",
      borderColor: "border-tertiary/20",
    },
    {
      icon: Satellite,
      name: t("satellite_engine"),
      tech: t("satellite_desc"),
      color: "from-secondary/20 via-secondary/10 to-transparent",
      borderColor: "border-secondary/20",
    },
    {
      icon: Cpu,
      name: t("ai_mentor"),
      tech: t("ai_mentor_desc"),
      color: "from-white/10 via-white/5 to-transparent",
      borderColor: "border-white/10",
    },
  ];

  const steps = [
    {
      num: "01",
      title: t("process_step_1_title"),
      desc: t("process_step_1_desc"),
    },
    {
      num: "02",
      title: t("process_step_2_title"),
      desc: t("process_step_2_desc"),
    },
    {
      num: "03",
      title: t("process_step_3_title"),
      desc: t("process_step_3_desc"),
    },
  ];

  return (
    <div className="w-full space-y-24 py-20">
      {/* How it Works */}
      <section className="app-shell animate-slide-up">
        <div className="text-center mb-16">
          <h2 className="section-heading text-on-surface mb-4">{t("how_it_works")}</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[2.25rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary-container font-black text-xl mb-6 shadow-[0_0_20px_rgba(78,222,163,0.3)] group-hover:scale-110 transition-transform duration-300">
                {step.num}
              </div>
              <h3 className="text-xl font-headline font-bold mb-3 text-on-surface">{step.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-[280px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Excellence */}
      <section className="app-shell">
        <div className="text-center mb-16">
          <h2 className="section-heading text-on-surface mb-4">{t("tech_stack")}</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-sm">
            Our platform leverages state-of-the-art machine learning architectures to provide production-grade agricultural intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techs.map((tech, idx) => (
            <div 
              key={idx} 
              className={`rounded-2xl glass-panel border ${tech.borderColor} p-8 flex flex-col items-start bg-gradient-to-br ${tech.color} group hover:translate-y-[-8px] transition-all duration-500`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-on-surface group-hover:text-primary transition-colors">
                <tech.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-headline font-bold mb-2 text-on-surface">{tech.name}</h3>
              <p className="text-xs font-label text-slate-400 uppercase tracking-widest mb-4">Architecture</p>
              <div className="h-[1px] w-full bg-white/5 mb-4" />
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {tech.tech}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Simplified */}
      <section className="app-shell py-16 px-4 sm:px-8 rounded-[2.5rem] bg-surface-container-low border border-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary/5 blur-[100px] rounded-full -z-10" />
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              System Core
            </div>
            <h2 className="text-3xl sm:text-4xl font-headline font-extrabold leading-tight">
              A Unified Ecosystem for <br /> Future-Ready Farming
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-base">
              KissanSahyog operates on a service-based architecture, decoupling data collection, processing, and prediction to ensure maximum reliability and speed. Our backend APIs communicate across multi-cloud environments to fetch satellite and climatic data in milliseconds.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Next.js Frontend</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>FastAPI Microservices</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>PyTorch Inference</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Supabase Persistence</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full glass-panel border border-white/5 rounded-3xl p-8 aspect-video flex items-center justify-center relative overflow-hidden">
             {/* Simple visual schematic representation */}
             <div className="flex flex-col items-center gap-4 relative z-10 scale-90 sm:scale-100">
                <div className="px-6 py-3 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold shadow-2xl">
                  Client Interface
                </div>
                <div className="w-[2px] h-6 bg-primary/30" />
                <div className="px-6 py-3 rounded-xl bg-tertiary/20 border border-tertiary/30 text-tertiary font-bold">
                  API Gateway (FastAPI)
                </div>
                <div className="w-full flex justify-center gap-8 items-center mt-2">
                   <div className="flex flex-col items-center">
                     <div className="w-[1px] h-6 bg-white/20" />
                     <div className="px-4 py-2 rounded-lg bg-surface-container-high border border-white/10 text-xs">NASA/GEE</div>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className="w-[1px] h-6 bg-white/20" />
                     <div className="px-4 py-2 rounded-lg bg-surface-container-high border border-white/10 text-xs">ML Models</div>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className="w-[1px] h-6 bg-white/20" />
                     <div className="px-4 py-2 rounded-lg bg-surface-container-high border border-white/10 text-xs">Gemini AI</div>
                   </div>
                </div>
             </div>
             <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-white/[0.02] -z-0 pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
