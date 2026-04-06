"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { getSentinelHubToken } from "./actions";
import { useLocation } from "../../../components/LocationContext";
import { Search, MapPin, Navigation, Droplet, AlertTriangle, TrendingUp, CheckCircle, Maximize, Minimize } from "lucide-react";

import { useTranslations } from "next-intl";

// Fix default leaflet marker icons (broken in webpack/Next.js)
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NDVI_EVALSCRIPT = `//VERSION=3
function setup() {
  return { input: ["B04", "B08", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  if (sample.dataMask === 0) return [0, 0, 0, 0];
  if (ndvi < -0.2) return [0.08, 0.47, 0.9, 0.9];   // water – blue
  if (ndvi < 0.1)  return [0.76, 0.6, 0.42, 1];      // bare soil – tan
  if (ndvi < 0.3)  return [0.8, 0.88, 0.2, 1];       // sparse/low veg – yellow-green
  if (ndvi < 0.5)  return [0.3, 0.72, 0.15, 1];      // moderate veg – green
  return [0.05, 0.38, 0.05, 1];                       // dense / healthy crop – dark green
}`;

// Bounding box around a GPS coordinate (±0.05° ~ 5.5 km for closer field view)
function bboxFromLatLng(lat: number, lng: number): [number, number, number, number] {
  const d = 0.05;
  return [lng - d, lat - d, lng + d, lat + d];
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

function getMockData(lat: number, lng: number) {
  const seed = Math.abs(lat + lng) * 10000;
  const ndviScore = 0.4 + (seed % 50) / 100;
  const moisture = 30 + (seed % 50);
  const expectedYield = 2.0 + (seed % 40) / 10;
  const hasAlert = seed % 10 > 5;
  return {
    ndviScore: ndviScore.toFixed(2),
    ndviStatus: ndviScore > 0.7 ? "Optimal" : ndviScore > 0.5 ? "Moderate" : "Low Vitality",
    moisture: Math.round(moisture),
    expectedYield: expectedYield.toFixed(1),
    hasAlert,
  };
}

export default function MapClient() {
  const t = useTranslations();
  const { location: globalLoc, refreshLocation, updateLocation, loading: globalLoading } = useLocation();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
 
  // Sync global location change (e.g. from nav or IP) to the map
  useEffect(() => {
    if (globalLoc.latitude && globalLoc.longitude && (!location || location.lat !== globalLoc.latitude || location.lng !== globalLoc.longitude)) {
      setLocation({ lat: globalLoc.latitude, lng: globalLoc.longitude });
    }
  }, [globalLoc.latitude, globalLoc.longitude]);



  // Search state
  interface NominatimSuggestion {
    lat: string;
    lon: string;
    display_name: string;
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [dates, setDates] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  });

  const [ndviUrl, setNdviUrl] = useState<string | null>(null);
  const [ndviBbox, setNdviBbox] = useState<[number, number, number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [showInsights, setShowInsights] = useState(true);
  const prevNdviUrl = useRef<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!mapRef.current) return;
    if (!document.fullscreenElement) {
      mapRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const mockData = location ? getMockData(location.lat, location.lng) : { ndviScore: '0.00', ndviStatus: 'Unknown', moisture: 0, expectedYield: '0.0', hasAlert: false };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for locations
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && showSuggestions) {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=in`;
        if (location) {
          const d = 0.5;
          url += `&viewbox=${location.lng - d},${location.lat + d},${location.lng + d},${location.lat - d}`;
        }
        fetch(url)
          .then(res => res.json())
          .then(data => setSuggestions(data))
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, showSuggestions, location]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const village = data.address?.village || data.address?.town || data.address?.suburb || data.address?.city || "";
      const state = data.address?.state || "";
      const name = village ? `${village}, ${state}` : state;
      if (name) setSearchQuery(name);
    } catch {
      // Ignore errors silently for reverse geocoding
    }
  };

  const locateUser = async () => {
    if (!navigator.geolocation) {
      alert(t("map.gps_unsupported"));
      return;
    }
    await refreshLocation();
    setNdviUrl(null); // Clear previous map layer
  };
 
  // Auto-detect GPS on mount (Redundant if LocationProvider does it, but keeping for UX)
  useEffect(() => {
    if (!globalLoc.latitude) {
      locateUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSelectLocation = (s: NominatimSuggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    updateLocation(lat, lng);


    // Format nice name
    const parts = s.display_name.split(',');
    const simpleName = parts.length >= 2 ? `${parts[0].trim()}, ${parts[parts.length - 2].trim()}` : s.display_name;

    setSearchQuery(simpleName);
    setShowSuggestions(false);
    setNdviUrl(null); // Clear old map overlay
  };

  const loadNDVI = async () => {
    if (!location) {
      alert(t("map.select_location"));
      return;
    }
    setLoading(true);
    setStatus(t("map.connecting"));
    try {
      const token = await getSentinelHubToken();
      const bbox = bboxFromLatLng(location.lat, location.lng);

      setStatus(t("map.scanning"));
      const payload = {
        input: {
          bounds: {
            bbox,
            properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
          },
          data: [
            {
              type: "sentinel-2-l2a",
              dataFilter: {
                timeRange: {
                  from: `${dates.from}T00:00:00Z`,
                  to: `${dates.to}T23:59:59Z`,
                },
              },
            },
          ],
        },
        output: {
          width: 800,
          height: 800,
          responses: [{ identifier: "default", format: { type: "image/png" } }],
        },
        evalscript: NDVI_EVALSCRIPT,
      };

      const res = await axios.post(
        process.env.NEXT_PUBLIC_KISSAN_SENTINEL_HUB_PROCESS_URL || "https://services.sentinel-hub.com/api/v1/process",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "image/png",
          },
          responseType: "blob",
        }
      );

      // Release previous blob to prevent memory leak
      if (prevNdviUrl.current) URL.revokeObjectURL(prevNdviUrl.current);
      const url = URL.createObjectURL(res.data);
      prevNdviUrl.current = url;

      setNdviUrl(url);
      setNdviBbox(bbox);
      setShowInsights(true);
      setStatus("");
    } catch {
      const msg = t("map.failed");
      setStatus("⚠️ " + msg);
    } finally {
      setLoading(false);
    }
  };

  const center: [number, number] = location
    ? [location.lat, location.lng]
    : [23.0, 72.6];

  // Handle Right Click (Context Menu) on the map natively
  function MapEventsHandler() {
    useMapEvents({
      contextmenu(e) {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng);
        setNdviUrl(null); // Clear previous map layer
      }
    });
    return null;
  }


  return (
    <div className="flex flex-col gap-4 sm:gap-6 flex-1 min-h-0 relative">
      {/* Search & Date Controls */}
      <div className="bg-surface/60 backdrop-blur-md rounded-2xl border border-outline-variant p-3 sm:p-4 flex flex-wrap gap-4 items-end shrink-0 shadow-lg relative z-20">

        {/* Location Search API */}
        <div className="flex flex-col gap-2 min-w-0 w-full lg:w-auto lg:flex-1 relative" ref={wrapperRef}>
          <span className="text-[10px] font-bold text-on-surface-muted uppercase tracking-[0.15em] flex items-center gap-1.5">
            <MapPin className="text-error w-3 h-3" />
            {t("map.field_location")}
          </span>
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t("map.search_placeholder")}
              className="w-full bg-background border border-outline-variant group-hover:border-primary/50 transition-colors rounded-xl pl-9 pr-10 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted" />

            <button
              onClick={locateUser}
              title={t("map.use_gps")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-primary transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[100%] left-0 w-full mt-2 bg-surface/95 backdrop-blur-xl border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="max-h-60 overflow-y-auto w-full">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectLocation(s)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 border-b border-white/5 last:border-0 truncate flex flex-col gap-0.5 group"
                  >
                    <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">{s.display_name.split(',')[0]}</span>
                    <span className="text-xs text-on-surface-muted truncate">{s.display_name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 sm:gap-4 flex-wrap w-full lg:w-auto">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-on-surface-muted uppercase tracking-[0.15em]">{t("map.start_date")}</span>
            <input
              type="date"
              value={dates.from}
              max={dates.to}
              onChange={(e) => setDates((d) => ({ ...d, from: e.target.value }))}
              className="bg-background border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface hover:border-primary/50 focus:outline-none focus:border-primary shadow-sm transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-on-surface-muted uppercase tracking-[0.15em]">{t("map.end_date")}</span>
            <input
              type="date"
              value={dates.to}
              min={dates.from}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDates((d) => ({ ...d, to: e.target.value }))}
              className="bg-background border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface hover:border-primary/50 focus:outline-none focus:border-primary shadow-sm transition-all"
            />
          </label>
        </div>

        <button
          onClick={loadNDVI}
          disabled={loading || !location}
          className="w-full sm:w-auto bg-gradient-to-r from-[#4CB828] to-[#15a855] hover:opacity-90 text-black font-extrabold px-6 sm:px-8 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:grayscale text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(76,184,40,0.3)] hover:shadow-[0_4px_25px_rgba(76,184,40,0.5)] min-w-[160px] lg:ml-auto"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-black/40 border-t-black rounded-full" />
              {t("map.scanning_btn")}
            </>
          ) : (
            <>
              <span className="text-lg">🛰</span> {t("map.scan_btn")}
            </>
          )}
        </button>
      </div>

      {status && !loading && (
        <div className="absolute top-[5.6rem] sm:top-24 left-1/2 -translate-x-1/2 z-[30] bg-background/90 text-on-surface px-5 py-2 rounded-full border border-outline-variant shadow-xl text-xs sm:text-sm font-medium backdrop-blur-md">
          {status}
        </div>
      )}

      {/* Map Section */}
      <div
        ref={mapRef}
        className={`relative flex-1 rounded-2xl overflow-hidden glass-panel border border-outline-variant shadow-2xl min-h-[420px] sm:min-h-[500px] z-10 ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : ''}`}
      >
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 left-3 z-[1000] bg-surface/90 hover:bg-surface border border-white/10 p-2 rounded-lg shadow-lg text-white/80 hover:text-white transition-all backdrop-blur-md"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* Detailed satellite basemap for farming instead of plain streets */}
          <TileLayer
            attribution='&copy; <a href="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">Esri</a>'
            url={process.env.NEXT_PUBLIC_KISSAN_ESRI_WORLD_IMAGERY_URL || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
          />

          <MapEventsHandler />

          {location && <FlyToLocation lat={location.lat} lng={location.lng} />}

          {location && !ndviUrl && (
            <Marker position={[location.lat, location.lng]}>
              <Popup className="rounded-xl overflow-hidden">
                <div className="text-sm font-medium p-1">
                  <strong>{t("map.selected_area")}</strong>
                  <div className="text-xs text-gray-500 mt-1">{searchQuery}</div>
                </div>
              </Popup>
            </Marker>
          )}

          {ndviUrl && ndviBbox && (
            <ImageOverlay
              url={ndviUrl}
              bounds={[
                [ndviBbox[1], ndviBbox[0]],
                [ndviBbox[3], ndviBbox[2]],
              ]}
              opacity={0.85} // Slightly more opaque for better visibility
            />
          )}
        </MapContainer>

        {/* Loading Blocker */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] gap-4">
            <div className="w-12 h-12 border-[5px] border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
            <p className="text-base text-white font-bold tracking-wider drop-shadow-md">{status}</p>
          </div>
        )}

        {/* Active Insight Panel */}
        {location && showInsights && (
          <div className="absolute top-4 right-4 z-[999] bg-surface/80 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] w-[min(88vw,300px)] flex flex-col gap-3 sm:gap-4 text-white text-left font-sans animate-fade-in-down overflow-hidden">
            {/* Subtle glow effect behind */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start relative z-10">
              <div className="relative z-10 mb-1">
                <h3 className="font-headline font-extrabold text-lg mb-0.5 truncate tracking-tight">{searchQuery || "Green Valley Estate"}</h3>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3">
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors shadow-inner">
                <div className="flex items-center gap-1.5 text-white/50 text-[9px] font-bold uppercase tracking-widest mb-2">
                  <Droplet className="w-3.5 h-3.5 text-[#E8B65A]" />
                  Moisture
                </div>
                <div>
                  <div className="text-xl font-extrabold tracking-tighter mb-1.5">{mockData.moisture}%</div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#E8B65A]/50 to-[#E8B65A]" style={{ width: `${mockData.moisture}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors shadow-inner">
                <div className="flex items-center gap-1.5 text-white/50 text-[9px] font-bold uppercase tracking-widest mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Est. Yield
                </div>
                <div>
                  <div className="text-xl font-extrabold tracking-tighter text-primary mb-1">{mockData.expectedYield} <span className="text-[10px] font-medium text-white/40 tracking-normal">t/ha</span></div>
                  <span className="text-primary text-[9px] font-bold bg-primary/10 px-1.5 py-0.5 rounded inline-block">↑ +0.4 t</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              {mockData.hasAlert ? (
                <div className="bg-gradient-to-r from-red-950/60 to-red-900/30 border border-red-500/40 rounded-xl p-3 flex gap-3 items-start shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 border-[16px] border-red-500/5 rounded-full -mt-6 -mr-6 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <div className="text-red-100 text-[10px] font-extrabold uppercase tracking-widest mb-1">Attention Required</div>
                    <div className="text-red-100/70 text-[10px] font-medium leading-normal">Low Nitrogen area detected. Consider targeted fertilization to fix deficiency.</div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-3 flex gap-3 items-start shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 border-[16px] border-primary/5 rounded-full -mt-6 -mr-6 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-white text-[10px] font-extrabold uppercase tracking-widest mb-1 block">Optimal Conditions</div>
                    <div className="text-white/60 text-[10px] font-medium leading-normal">No critical anomalies detected in the selected field area.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Removed phenology and report sections for cleaner view */}
          </div>
        )}

        {/* Bottom Left Panel: Vegetation Index */}
        {location && (
          <div className="hidden md:block absolute bottom-6 left-6 z-[999] bg-surface/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] w-[260px] text-white font-sans animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-headline font-extrabold text-sm text-white tracking-wider">Vegetation Index</h4>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-white/40 mb-2 uppercase tracking-widest">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden flex mb-5 shadow-inner">
              <div className="h-full bg-[#E85A5A] flex-[1]"></div>
              <div className="h-full bg-[#E8B65A] flex-[1]"></div>
              <div className="h-full bg-[#CCDC33] flex-[1]"></div>
              <div className="h-full bg-[#4CB828] flex-[1]"></div>
              <div className="h-full bg-[#0D610D] flex-[1]"></div>
            </div>

            <div className="flex gap-3">
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex-1 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Avg Score</div>
                <div className="text-xl font-extrabold tracking-tighter">{mockData.ndviScore}</div>
              </div>
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex-1 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col justify-end">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Status</div>
                <div className="text-sm font-bold truncate tracking-tight" style={{ color: mockData.ndviStatus === 'Optimal' ? '#4CB828' : mockData.ndviStatus === 'Moderate' ? '#CCDC33' : '#E8B65A' }}>{mockData.ndviStatus}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
