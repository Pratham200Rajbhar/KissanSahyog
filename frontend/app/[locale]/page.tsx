"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { ArrowRight, PlayCircle, Droplets, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";

export default function LandingPage() {
  const t = useTranslations();
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden min-h-[calc(100vh-80px)] flex flex-col items-center liquid-bg">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl px-6 pt-24 pb-32 flex flex-col items-center text-center z-10">
          {/* Floating Decorative Element */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10 animate-fade-in" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-white/5 text-primary text-xs font-bold uppercase tracking-widest mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t("landing.v4_live")}
          </div>

          <h1 className="font-headline text-5xl md:text-8xl font-extrabold tracking-tight text-on-surface mb-8 max-w-5xl leading-[1.1] animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {t("landing.future_of")} <br />
            <span className="bg-gradient-to-r from-primary via-primary-container to-tertiary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(78,222,163,0.3)]">
              {t("landing.fertile_intelligence")}
            </span>
          </h1>

          <p className="font-body text-on-surface-variant text-lg md:text-xl max-w-2xl mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {t("landing.hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <button 
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-[0_0_40px_rgba(78,222,163,0.2)] hover:shadow-[0_0_60px_rgba(78,222,163,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
            >
              {t("landing.start_prediction")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>


          {/* Dashboard Preview / Bento Grid Section */}
          <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-12 gap-6 animate-scale-in" style={{ animationDelay: "0.6s" }}>
            {/* Main Preview */}
            <div className="md:col-span-8 rounded-xl overflow-hidden glass-panel border border-white/5 relative group">
              <Image
                className="w-full h-auto object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                alt="Cinematic aerial view of modern circular farm fields"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXqKvVrRI4b__XPJjFqAZgxsT_Iyp0XA_EsWAAOPXPpvm6_RTkbKIlfkaykybkCG_3MLS-ATNFIpgnaohu8l2vK94phMTmZs1NQOYJSsu3LSV4-NvyU9fIOzbkX4DUkNcyz3BL4ue2u6Jhnu3bIvjL2BqPP0lhiwzcqDp7LwqQ3vTp0Cbiw8PhGmMBI6L6ki_sQVAMBBCLvJfwPXSHHJ0B0fA4F71IoimLVnAxvA_Yn16GV1oUCTYJaF9rZHLKWxQVKbiroDf7j6SZ"
                width={800}
                height={400}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-left">
                <p className="text-primary font-bold tracking-widest text-xs uppercase mb-2">{t("landing.monitor_title")}</p>
                <h3 className="text-2xl font-headline font-bold">{t("landing.monitor_sector")}</h3>
              </div>
              <div className="absolute top-8 right-8 flex gap-4">
                <div className="px-3 py-1 rounded-full glass-panel border border-white/10 flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t("landing.soil_sensor")}
                </div>
              </div>
            </div>

            {/* Metric Card 1 */}
            <div className="md:col-span-4 rounded-xl glass-panel border border-white/5 p-8 flex flex-col justify-between text-left">
              <div>
                <div className="w-12 h-12 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary mb-6">
                  <Droplets className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-label uppercase tracking-widest text-slate-400 mb-2">{t("landing.hydration_level")}</h4>
                <div className="text-4xl font-headline font-bold text-on-surface">94.2%</div>
              </div>
              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-xs font-label">
                  <span className="text-slate-400">{t("landing.optimal_range")}</span>
                  <span className="text-primary">92% - 98%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-[94%]" />
                </div>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="md:col-span-4 rounded-xl glass-panel border border-white/5 p-8 flex flex-col text-left">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-label uppercase tracking-widest text-slate-400 mb-2">{t("landing.growth_prediction")}</h4>
              <div className="text-4xl font-headline font-bold text-on-surface mb-4">+24%</div>
              <p className="text-sm text-slate-400">{t("landing.yield_increase_desc")}</p>
            </div>

            {/* Feature Grid */}
            <div className="md:col-span-8 rounded-xl glass-panel border border-white/5 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 text-left flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                <h4 className="text-xl font-headline font-bold mb-4">{t("landing.algorithms_title")}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t("landing.algorithms_desc")}
                </p>
              </div>
              <div className="md:w-1/2 relative min-h-[200px]">
                <Image
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                  alt="Microscopic laboratory lens"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNdSavlZF_6zWpFq8z8Bw4d2L-sij-rDSOpm9VYveknl_VEQscT2pyh0xbdZt0lDQxsSIiUnyOlVDt-JwK-Fa9B4z071NE7RC0jfXdCDYhfjUJMXpvgltbMyAN_wLI8T2y9PFP9nie0Z0j7jUMdjjEXBMdsu9czZ5eRaWfTgEBvCUin6EEFQPg7yOSlYHPn6qsX9NVvbUZhMpXhp1--BMbj4GZlMLTqrBBk_Avq1DxY_aaYSc-lEHvXmvm7omZzskxw8YXnuGjGg8K"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-surface-container-high/50 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full bg-surface-container-low py-24 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-2">1.2M</div>
              <div className="text-xs font-label uppercase tracking-widest text-slate-500">{t("landing.hectares_managed")}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-2">99.8%</div>
              <div className="text-xs font-label uppercase tracking-widest text-slate-500">{t("landing.accuracy")}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-2">140+</div>
              <div className="text-xs font-label uppercase tracking-widest text-slate-500">{t("landing.variants")}</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-2">35%</div>
              <div className="text-xs font-label uppercase tracking-widest text-slate-500">{t("landing.savings")}</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
