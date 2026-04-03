"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Tractor, Activity, Lightbulb, Calendar, X, Check, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function AnalysisPage() {
  const t = useTranslations();
  const [history, setHistory] = useState<{
    yield_predictions: any[],
    disease_detections: any[],
    crop_recommendations: any[]
  }>({
    yield_predictions: [],
    disease_detections: [],
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
    diseases: true,
    recommendations: true
  });

  useEffect(() => {
    const fetchFullHistory = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/history/full", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          }
        });
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

  const filterByDate = (items: any[]) => {
    return items.filter(item => {
      if (!startDate && !endDate) return true;
      const date = new Date(item.created_at).getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity; 
      return date >= start && date <= end;
    });
  };

  const filteredYields = filterByDate(history.yield_predictions);
  const filteredDiseases = filterByDate(history.disease_detections);
  const filteredCrops = filterByDate(history.crop_recommendations);

  const triggerDownload = () => {
    setIsModalOpen(false);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.text(t("AgriAI Farmer Report"), pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    // Add date range info
    let subtitle = `${t("Generated on:")} ${new Date().toLocaleString()}`;
    if (startDate || endDate) {
      subtitle += ` | ${t("Filters:")} ${startDate || t("Start Date")} ${t("to")} ${endDate || t("Present")}`;
    }
    doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

    let finalY = 35;

    // 1. Yield Predictions
    if (downloadOptions.yields && filteredYields.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(t("Yield Predictions History"), 14, finalY);
      
      const yieldData = filteredYields.map((y) => [
        new Date(y.created_at).toLocaleDateString(),
        y.crop,
        `${y.state_name || '-'}, ${y.district_name || '-'}`,
        `${y.area_ha || '-'} ha`,
        `${y.predicted_yield} kg/ha`
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [[t('Date'), t('Crop'), t('Location'), t('Area (ha)'), t('Predicted Yield')]],
        body: yieldData,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] }
      });
      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 2. Disease Detections
    if (downloadOptions.diseases && filteredDiseases.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(t("Crop Health & Disease Logs"), 14, finalY);
      
      const diseaseData = filteredDiseases.map((d) => [
        new Date(d.created_at).toLocaleDateString(),
        d.crop,
        d.disease_name,
        `${(d.confidence * 100).toFixed(1)}%`,
        d.remedy
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [[t('Date'), t('Crop'), t('Disease'), t('Confidence'), t('Recommended Remedy')]],
        body: diseaseData,
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        columnStyles: { 4: { cellWidth: 70 } }
      });
      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 3. Crop Recommendations
    if (downloadOptions.recommendations && filteredCrops.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(t("AI Crop Recommendations"), 14, finalY);
      
      const recData = filteredCrops.map((c) => [
        new Date(c.created_at).toLocaleDateString(),
        c.top_crop,
        `${(c.confidence * 100).toFixed(1)}%`,
        c.recommendations_json ? c.recommendations_json.map((r: any) => r.crop).join(", ") : '-'
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [[t('Date'), t('Top Recommendation'), t('Confidence'), t('Other Options Taken')]],
        body: recData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    doc.save(`AgriAI_Custom_Report_${new Date().getTime()}.pdf`);
  };

  const toggleOption = (key: 'yields' | 'diseases' | 'recommendations') => {
    setDownloadOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h2 className="text-white font-headline text-xl">{t("Loading complete history...")}</h2>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-fade-in relative z-10 px-4 pb-12">
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
                <Filter className="text-primary w-5 h-5"/> {t("Customize Report")}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{t("Select data sections and perfectly filter your exported PDF.")}</p>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Date Filters Section inside Modal */}
              <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="font-label text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4"/> {t("Export Date Range")}
                </h4>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">{t("Start Date")}</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#0b1326] border border-outline-variant/10 rounded-lg text-sm text-white px-3 py-2 outline-none font-label focus:border-primary/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter-invert"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">{t("End Date")}</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#0b1326] border border-outline-variant/10 rounded-lg text-sm text-white px-3 py-2 outline-none font-label focus:border-primary/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter-invert"
                    />
                  </div>
                </div>
              </div>

              <h4 className="font-label text-xs uppercase tracking-wider text-slate-400 mb-3">{t("Include Sections")}</h4>
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
                      <div className="font-bold text-sm">{t("Yield Predictions")}</div>
                      <div className="text-xs opacity-70">{filteredYields.length} {t("records in range")}</div>
                    </div>
                  </div>
                  {downloadOptions.yields && <Check className="w-5 h-5 text-primary" />}
                </button>

                {/* Disease Option */}
                <button 
                  onClick={() => toggleOption('diseases')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${downloadOptions.diseases ? 'bg-red-400/10 border-red-400/30 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${downloadOptions.diseases ? 'bg-red-400 text-[#0b1326]' : 'bg-white/10'}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">{t("Disease Detections")}</div>
                      <div className="text-xs opacity-70">{filteredDiseases.length} {t("records in range")}</div>
                    </div>
                  </div>
                  {downloadOptions.diseases && <Check className="w-5 h-5 text-red-400" />}
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
                      <div className="font-bold text-sm">{t("Recommendations")}</div>
                      <div className="text-xs opacity-70">{filteredCrops.length} {t("records in range")}</div>
                    </div>
                  </div>
                  {downloadOptions.recommendations && <Check className="w-5 h-5 text-blue-400" />}
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex-shrink-0">
              <button 
                onClick={triggerDownload}
                disabled={!downloadOptions.yields && !downloadOptions.diseases && !downloadOptions.recommendations}
                className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-primary text-[#0b1326] font-label text-base font-bold hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className="w-5 h-5" />
                {t("Generate My Report")}
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("Data Hub")}
          </span>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white">{t("Full History")}</h2>
          <p className="text-slate-400 mt-2">{t("View all your chronological past logs in one place.")}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-end">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-primary text-[#0b1326] font-label text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            {t("Download Now")}
          </button>
        </div>
      </div>

      <div className="glass-panel p-2 mb-6 rounded-xl flex flex-wrap gap-2 w-fit border border-outline-variant/10">
        <button 
          onClick={() => setActiveTab("yield")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-label text-sm transition-all duration-300 ${activeTab === 'yield' ? 'bg-primary/20 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Tractor className="w-4 h-4" /> {t("Yields")} ({history.yield_predictions.length})
        </button>
        <button 
          onClick={() => setActiveTab("disease")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-label text-sm transition-all duration-300 ${activeTab === 'disease' ? 'bg-red-400/20 text-red-400 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Activity className="w-4 h-4" /> {t("Diseases")} ({history.disease_detections.length})
        </button>
        <button 
          onClick={() => setActiveTab("recommend")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-label text-sm transition-all duration-300 ${activeTab === 'recommend' ? 'bg-blue-400/20 text-blue-400 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Lightbulb className="w-4 h-4" /> {t("Recommendations")} ({history.crop_recommendations.length})
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-outline-variant/5 shadow-2xl">
        
        {/* Yield Tab */}
        {activeTab === "yield" && (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-300 font-label text-xs uppercase tracking-wider border-b border-primary/20">
                  <th className="p-4 py-5 font-bold">{t("Date")}</th>
                  <th className="p-4 py-5 font-bold">{t("Crop")}</th>
                  <th className="p-4 py-5 font-bold">{t("Location")}</th>
                  <th className="p-4 py-5 font-bold">{t("Area (ha)")}</th>
                  <th className="p-4 py-5 font-bold text-right">{t("Yield (kg/ha)")}</th>
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
                      <p className="text-lg font-bold">{t("No yield predictions found.")}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Disease Tab */}
        {activeTab === "disease" && (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-400/5 text-slate-300 font-label text-xs uppercase tracking-wider border-b border-red-400/20">
                  <th className="p-4 py-5 font-bold">{t("Date")}</th>
                  <th className="p-4 py-5 font-bold">{t("Crop")}</th>
                  <th className="p-4 py-5 font-bold">{t("Disease")}</th>
                  <th className="p-4 py-5 font-bold">{t("Confidence")}</th>
                  <th className="p-4 py-5 font-bold">{t("Remedy Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300 font-label">
                {history.disease_detections.length > 0 ? history.disease_detections.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-white">{d.crop}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-red-400/10 rounded border border-red-400/20 text-red-400 font-bold inline-block">{d.disease_name}</span></td>
                    <td className="p-4">{(d.confidence * 100).toFixed(1)}%</td>
                    <td className="p-4 text-slate-300 max-w-sm" title={d.remedy}>
                      <span className="line-clamp-2">{d.remedy}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500 font-label flex-col items-center flex justify-center">
                      <Activity className="w-12 h-12 mb-4 opacity-50 text-red-400"/>
                      <p className="text-lg font-bold">{t("No disease detections found.")}</p>
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
                  <th className="p-4 py-5 font-bold">{t("Date")}</th>
                  <th className="p-4 py-5 font-bold text-blue-400">{t("Match")}</th>
                  <th className="p-4 py-5 font-bold">{t("Confidence")}</th>
                  <th className="p-4 py-5 font-bold">{t("Other Options Analyzed")}</th>
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
                      {c.recommendations_json?.map((r: any) => r.crop).join(", ") || "-"}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500 font-label flex-col items-center flex justify-center">
                      <Lightbulb className="w-12 h-12 mb-4 opacity-50 text-blue-400"/>
                      <p className="text-lg font-bold">{t("No crop recommendations logged.")}</p>
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
