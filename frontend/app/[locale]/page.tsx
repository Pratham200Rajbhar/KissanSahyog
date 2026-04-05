import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { Droplets, TrendingUp, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import HeroActions from "../components/HeroActions";
import TechSection from "../components/TechSection";

export default async function LandingPage() {
  const t = await getTranslations();
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden min-h-[calc(100vh-72px)] flex flex-col items-center liquid-bg">
        {/* Hero Section */}
        <section className="relative app-shell pt-14 sm:pt-28 pb-16 sm:pb-32 flex flex-col items-center text-center z-10 app-section">
          {/* Floating Decorative Element */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[22rem] sm:w-[36rem] h-[22rem] sm:h-[36rem] bg-primary/10 blur-[130px] rounded-full -z-10 animate-fade-in" />

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel border border-white/10 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-10 animate-slide-up animation-delay-100 shadow-[0_0_20px_rgba(78,222,163,0.1)]">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            {t("landing.v4_live")}
          </div>

          <h1 className="font-headline text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-on-surface mb-8 max-w-6xl leading-[0.98] animate-slide-up animation-delay-200">
            {t("landing.future_of")} <br />
            <span className="bg-gradient-to-r from-primary via-primary-container to-tertiary bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(78,222,163,0.4)]">
              {t("landing.fertile_intelligence")}
            </span>
          </h1>

          <p className="font-body text-on-surface-variant text-lg sm:text-xl max-w-3xl mb-12 sm:mb-14 leading-relaxed animate-slide-up animation-delay-300 opacity-90">
            {t("landing.hero_subtitle")}
          </p>

          <div className="animate-slide-up animation-delay-400">
            <HeroActions label={t("landing.start_prediction")} />
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-8 animate-fade-in animation-delay-700 pointer-events-none opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
             <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase"><ShieldCheck className="w-4 h-4" /> Secure Infrastructure</div>
             <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase"><Sparkles className="w-4 h-4" /> AI Powered</div>
             <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase"><Zap className="w-4 h-4" /> Real-time Data</div>
          </div>
        </section>

        {/* Feature Bento Grid Section */}
        <section className="w-full py-16 sm:py-24 bg-surface-container-low/40">
           <div className="app-shell grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Preview */}
              <div className="lg:col-span-8 rounded-3xl overflow-hidden glass-panel border border-white/5 relative group min-h-[360px] sm:min-h-[440px] shadow-2xl">
                <Image
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[2000ms]"
                  alt="Cinematic aerial view of modern circular farm fields"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXqKvVrRI4b__XPJjFqAZgxsT_Iyp0XA_EsWAAOPXPpvm6_RTkbKIlfkaykybkCG_3MLS-ATNFIpgnaohu8l2vK94phMTmZs1NQOYJSsu3LSV4-NvyU9fIOzbkX4DUkNcyz3BL4ue2u6Jhnu3bIvjL2BqPP0lhiwzcqDp7LwqQ3vTp0Cbiw8PhGmMBI6L6ki_sQVAMBBCLvJfwPXSHHJ0B0fA4F71IoimLVnAxvA_Yn16GV1oUCTYJaF9rZHLKWxQVKbiroDf7j6SZ"
                  fill
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-8 sm:bottom-12 left-8 sm:left-12 text-left">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">Live Monitoring</div>
                  <h3 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface">{t("landing.monitor_sector")}</h3>
                  <p className="text-on-surface-variant mt-2 max-w-sm">Autonomous data harvesting from orbital sensors providing 2.4cm precision mapping.</p>
                </div>
                <div className="absolute top-8 right-8 hidden sm:flex gap-4">
                  <div className="px-5 py-2.5 rounded-2xl glass-panel border border-white/10 flex items-center gap-3 text-xs shadow-lg backdrop-blur-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#4edea3]" />
                    {t("landing.soil_sensor")}
                  </div>
                </div>
              </div>

              {/* Metric Card 1 */}
              <div className="lg:col-span-4 rounded-3xl glass-panel border border-white/5 p-8 sm:p-10 flex flex-col justify-between text-left shadow-xl hover:bg-white/[0.02] transition-colors group">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-tertiary/20 flex items-center justify-center text-tertiary mb-8 group-hover:scale-110 transition-transform">
                    <Droplets className="w-7 h-7" />
                  </div>
                  <h4 className="text-xs font-label uppercase tracking-[0.2em] text-slate-400 mb-2">{t("landing.hydration_level")}</h4>
                  <div className="text-5xl font-headline font-extrabold text-on-surface tracking-tighter">94.2%</div>
                </div>
                <div className="mt-12 space-y-4">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">{t("landing.optimal_range")}</span>
                    <span className="text-primary font-black">92% - 98%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[2px]">
                    <div className="h-full bg-gradient-to-r from-tertiary/60 to-tertiary rounded-full w-[94.2%] shadow-[0_0_15px_rgba(123,209,250,0.4)]" />
                  </div>
                </div>
              </div>

              {/* Metric Card 2 */}
              <div className="lg:col-span-4 rounded-3xl glass-panel border border-white/5 p-10 flex flex-col text-left shadow-xl hover:bg-white/[0.02] transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h4 className="text-xs font-label uppercase tracking-[0.2em] text-slate-400 mb-2">{t("landing.growth_prediction")}</h4>
                <div className="text-5xl font-headline font-extrabold text-on-surface mb-6 tracking-tighter">+24.8%</div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{t("landing.yield_increase_desc")}</p>
                <div className="mt-8 flex gap-2">
                   <div className="h-1 w-8 bg-primary rounded-full" />
                   <div className="h-1 w-4 bg-white/10 rounded-full" />
                   <div className="h-1 w-4 bg-white/10 rounded-full" />
                </div>
              </div>

              {/* Feature Box */}
              <div className="lg:col-span-8 rounded-3xl glass-panel border border-white/5 overflow-hidden flex flex-col lg:flex-row shadow-xl">
                <div className="lg:w-1/2 p-8 sm:p-12 text-left flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/5">
                  <h4 className="text-2xl font-headline font-extrabold mb-6 text-on-surface">{t("landing.algorithms_title")}</h4>
                  <p className="text-slate-400 leading-relaxed text-base font-medium">
                    {t("landing.algorithms_desc")}
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                     <div className="px-4 py-2 rounded-xl bg-white/5 text-[10px] uppercase font-black border border-white/5 tracking-widest">Neural Net</div>
                     <div className="px-4 py-2 rounded-xl bg-white/5 text-[10px] uppercase font-black border border-white/5 tracking-widest">ML Ops</div>
                  </div>
                </div>
                <div className="lg:w-1/2 relative min-h-[240px]">
                  <Image
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-[2000ms]"
                    alt="Microscopic laboratory lens"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNdSavlZF_6zWpFq8z8Bw4d2L-sij-rDSOpm9VYveknl_VEQscT2pyh0xbdZt0lDQxsSIiUnyOlVDt-JwK-Fa9B4z071NE7RC0jfXdCDYhfjUJMXpvgltbMyAN_wLI8T2y9PFP9nie0Z0j7jUMdjjEXBMdsu9czZ5eRaWfTgEBvCUin6EEFQPg7yOSlYHPn6qsX9NVvbUZhMpXhp1--BMbj4GZlMLTqrBBk_Avq1DxY_aaYSc-lEHvXmvm7omZzskxw8YXnuGjGg8K"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-surface-container-high/60 to-transparent" />
                </div>
              </div>
           </div>
        </section>

        {/* Technical Section */}
        <TechSection />

        {/* Stats Section */}
        <section className="w-full bg-surface-container-low py-20 sm:py-28 border-y border-white/5">
          <div className="app-shell grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-20 text-center">
            <div className="group">
              <div className="text-5xl md:text-6xl font-headline font-black text-primary mb-3 group-hover:scale-110 transition-transform">1.2M</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{t("landing.hectares_managed")}</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-headline font-black text-primary mb-3 group-hover:scale-110 transition-transform">99.8%</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{t("landing.accuracy")}</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-headline font-black text-primary mb-3 group-hover:scale-110 transition-transform">140+</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{t("landing.variants")}</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-headline font-black text-primary mb-3 group-hover:scale-110 transition-transform">35%</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{t("landing.savings")}</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
