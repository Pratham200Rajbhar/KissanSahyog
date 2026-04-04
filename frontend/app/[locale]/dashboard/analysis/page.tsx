"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Tractor, Lightbulb, Calendar, X, Check, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface YieldPrediction {
  id: string;
  crop: string;
  state_name: string;
  district_name: string;
  area_ha: number;
  predicted_yield: number;
  created_at: string;
}


interface CropRecommendation {
  id: string;
  top_crop: string;
  confidence: number;
  recommendations_json: { crop: string; confidence: number }[];
  created_at: string;
}

export default function AnalysisPage() {
  const t = useTranslations();
  const [history, setHistory] = useState<{
    yield_predictions: YieldPrediction[],
    crop_recommendations: CropRecommendation[]
  }>({
    yield_predictions: [],
    crop_recommendations: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("yield");
  
  // Date range filters for REPORT
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Download Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState({
    yields: true,
    recommendations: true
  });

  useEffect(() => {
    const fetchFullHistory = async () => {
      try {
        const res = await fetch("/api/history/full");
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load full history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullHistory();
  }, []);

  const filterByDate = <T extends { created_at: string }>(items: T[]): T[] => {
    return items.filter(item => {
      if (!startDate && !endDate) return true;
      const date = new Date(item.created_at).getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity; 
      return date >= start && date <= end;
    });
  };

  const filteredYields = filterByDate(history.yield_predictions);
  const filteredCrops = filterByDate(history.crop_recommendations);

  const triggerDownload = () => {
    setIsModalOpen(false);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.text(t("analysis.report_title"), pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    // Add date range info
    let subtitle = `${t("analysis.generated_on")} ${new Date().toLocaleString()}`;
    if (startDate || endDate) {
      subtitle += ` | ${t("analysis.filters")} ${startDate || t("analysis.start_date")} ${t("analysis.to")} ${endDate || t("analysis.present")}`;
    }
    doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

    let finalY = 35;

    // 1. Yield Predictions
    if (downloadOptions.yields && filteredYields.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(t("analysis.yield_history"), 14, finalY);
      
      const yieldData = filteredYields.map((y) => [
        new Date(y.created_at).toLocaleDateString(),
        y.crop,
        `${y.state_name || '-'}, ${y.district_name || '-'}`,
        `${y.area_ha || '-'} ha`,
        `${y.predicted_yield} kg/ha`
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [[t("analysis.date"), t("analysis.crop"), t("analysis.location"), t("analysis.area"), t("analysis.yield_unit")]],
        body: yieldData,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] }
      });
      finalY = (doc as jsPDFWithAutoTable).lastAutoTable.finalY + 15;
    }


    // 3. Crop Recommendations
    if (downloadOptions.recommendations && filteredCrops.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(t("analysis.crop_recs"), 14, finalY);
      
      const recData = filteredCrops.map((c) => [
        new Date(c.created_at).toLocaleDateString(),
        c.top_crop,
        `${(c.confidence * 100).toFixed(1)}%`,
        c.recommendations_json ? c.recommendations_json.map((r: { crop: string }) => r.crop).join(", ") : '-'
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [[t("analysis.date"), t("analysis.top_rec"), t("analysis.confidence"), t("analysis.other_options")]],
        body: recData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    doc.save(`KissanSahyog_Custom_Report_${new Date().getTime()}.pdf`);
  };

  const toggleOption = (key: 'yields' | 'recommendations') => {
    setDownloadOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h2 className="text-white font-headline text-xl">{t("analysis.loading")}</h2>
      </div>
    );
  }

  return (
    <div className="mt-2 sm:mt-4 animate-fade-in relative z-10 pb-10">
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1326]/80 backdrop-blur-sm">
          <div className="bg-[#121c33] border border-outline-variant/10 rounded-2xl w-full max-w-lg shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 pb-4 border-b border-white/5 flex-shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-headline text-xl text-white font-bold flex items-center gap-2">
                <Filter className="text-primary w-5 h-5"/> {t("analysis.customize_report")}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{t("analysis.customize_desc")}</p>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Date Filters Section inside Modal */}
              <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="font-label text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4"/> {t("analysis.export_range")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">{t("analysis.start_date")}</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#0b1326] border border-outline-variant/10 rounded-lg text-sm text-white px-3 py-2 outline-none font-label focus:border-primary/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter-invert"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">{t("analysis.end_date")}</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#0b1326] border border-outline-variant/10 rounded-lg text-sm text-white px-3 py-2 outline-none font-label focus:border-primary/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter-invert"
                    />
                  </div>
                </div>
              </div>

              <h4 className="font-label text-xs uppercase tracking-wider text-slate-400 mb-3">{t("analysis.include_sections")}</h4>
              <div className="space-y-3">
                {/* Yield Option */}
                <button 
                  onClick={() => toggleOption('yields')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${downloadOptions.yields ? 'bg-primary/10 border-primary/30 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${downloadOptions.yields ? 'bg-primary text-[#0b1326]' : 'bg-white/10'}`}>
                      <Tractor className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">{t("analysis.yield_predictions")}</div>
                      <div className="text-xs opacity-70">{filteredYields.length} {t("analysis.records_range")}</div>
                    </div>
                  </div>
                  {downloadOptions.yields && <Check className="w-5 h-5 text-primary" />}
                </button>


                {/* Recommendations Option */}
                <button 
                  onClick={() => toggleOption('recommendations')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${downloadOptions.recommendations ? 'bg-blue-400/10 border-blue-400/30 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${downloadOptions.recommendations ? 'bg-blue-400 text-[#0b1326]' : 'bg-white/10'}`}>
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">{t("analysis.recommendations")}</div>
                      <div className="text-xs opacity-70">{filteredCrops.length} {t("analysis.records_range")}</div>
                    </div>
                  </div>
                  {downloadOptions.recommendations && <Check className="w-5 h-5 text-blue-400" />}
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex-shrink-0">
              <button 
                onClick={triggerDownload}
                disabled={!downloadOptions.yields && !downloadOptions.recommendations}
                className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-primary text-[#0b1326] font-label text-base font-bold hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className="w-5 h-5" />
                {t("analysis.generate_report")}
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-5">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("analysis.data_hub")}
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{t("analysis.full_history")}</h2>
          <p className="text-slate-400 mt-2">{t("analysis.history_desc")}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-end">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-primary text-[#0b1326] font-label text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            {t("analysis.download_now")}
          </button>
        </div>
      </div>

      <div className="glass-panel p-2 mb-5 sm:mb-6 rounded-xl flex flex-wrap gap-2 w-full sm:w-fit border border-outline-variant/10">
        <button 
          onClick={() => setActiveTab("yield")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-label text-sm transition-all duration-300 ${activeTab === 'yield' ? 'bg-primary/20 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Tractor className="w-4 h-4" /> {t("analysis.yields_tab")} ({history.yield_predictions.length})
        </button>
        <button 
          onClick={() => setActiveTab("recommend")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-label text-sm transition-all duration-300 ${activeTab === 'recommend' ? 'bg-blue-400/20 text-blue-400 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Lightbulb className="w-4 h-4" /> {t("analysis.recommendations")} ({history.crop_recommendations.length})
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-outline-variant/5 shadow-2xl">
        
        {/* Yield Tab */}
        {activeTab === "yield" && (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-300 font-label text-xs uppercase tracking-wider border-b border-primary/20">
                  <th className="p-4 py-5 font-bold">{t("analysis.date")}</th>
                  <th className="p-4 py-5 font-bold">{t("analysis.crop")}</th>
                  <th className="p-4 py-5 font-bold">{t("analysis.location")}</th>
                  <th className="p-4 py-5 font-bold">{t("analysis.area")}</th>
                  <th className="p-4 py-5 font-bold text-right">{t("analysis.yield_unit")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300 font-label">
                {history.yield_predictions.length > 0 ? history.yield_predictions.map((y) => (
                  <tr key={y.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">{new Date(y.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white"><span className="px-2 py-1 bg-primary/10 rounded border border-primary/20 text-primary">{y.crop}</span></td>
                    <td className="p-4">{y.state_name}, {y.district_name}</td>
                    <td className="p-4">{y.area_ha}</td>
                    <td className="p-4 text-primary font-bold text-right">{y.predicted_yield}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500 font-label flex-col items-center flex justify-center">
                      <Tractor className="w-12 h-12 mb-4 opacity-50 text-primary"/>
                      <p className="text-lg font-bold">{t("analysis.no_yields")}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}


        {/* Recommend Tab */}
        {activeTab === "recommend" && (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-400/5 text-slate-300 font-label text-xs uppercase tracking-wider border-b border-blue-400/20">
                  <th className="p-4 py-5 font-bold">{t("analysis.date")}</th>
                  <th className="p-4 py-5 font-bold text-blue-400">{t("analysis.match")}</th>
                  <th className="p-4 py-5 font-bold">{t("analysis.confidence")}</th>
                  <th className="p-4 py-5 font-bold">{t("analysis.other_analyzed")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300 font-label">
                {history.crop_recommendations.length > 0 ? history.crop_recommendations.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-400/10 rounded border border-blue-400/20 text-blue-400 font-bold block w-fit shadow-[0_0_10px_rgba(96,165,250,0.1)]">
                        {c.top_crop}
                      </span>
                    </td>
                    <td className="p-4 text-white font-bold">{(c.confidence * 100).toFixed(1)}%</td>
                    <td className="p-4 text-slate-400">
                      {c.recommendations_json?.map((r: { crop: string }) => r.crop).join(", ") || "-"}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500 font-label flex-col items-center flex justify-center">
                      <Lightbulb className="w-12 h-12 mb-4 opacity-50 text-blue-400"/>
                      <p className="text-lg font-bold">{t("analysis.no_recommendations")}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
