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
import { Search, MapPin, Navigation } from "lucide-react";
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

export default function MapClient() {
  const t = useTranslations();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const NDVI_LEGEND = [
    { color: "#155F8F", label: t("map.legend_water") },
    { color: "#C29A6B", label: t("map.legend_soil") },
    { color: "#CCDC33", label: t("map.legend_sparse") },
    { color: "#4CB828", label: t("map.legend_moderate") },
    { color: "#0D610D", label: t("map.legend_healthy") },
  ];

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
  const prevNdviUrl = useRef<string | null>(null);

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

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert(t("map.gps_unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        reverseGeocode(lat, lng);
        setNdviUrl(null); // Clear previous map layer
      },
      () => {
        alert(t("map.gps_error"));
      },
      { timeout: 8000 }
    );
  };

  // Auto-detect GPS on mount
  useEffect(() => {
    locateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectLocation = (s: NominatimSuggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setLocation({ lat, lng });

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
        "https://services.sentinel-hub.com/api/v1/process",
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
        setLocation({ lat, lng });
        reverseGeocode(lat, lng);
        setNdviUrl(null); // Clear previous map layer
      }
    });
    return null;
  }

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 relative">
      {/* Search & Date Controls */}
      <div className="bg-surface/60 backdrop-blur-md rounded-2xl border border-outline-variant p-4 flex flex-wrap gap-5 items-end shrink-0 shadow-lg relative z-20">

        {/* Location Search API */}
        <div className="flex flex-col gap-2 min-w-[280px] flex-1 relative" ref={wrapperRef}>
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

        <div className="flex gap-4 flex-wrap">
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
          className="bg-gradient-to-r from-[#4CB828] to-[#15a855] hover:opacity-90 text-black font-extrabold px-8 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:grayscale text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(76,184,40,0.3)] hover:shadow-[0_4px_25px_rgba(76,184,40,0.5)] min-w-[160px] ml-auto"
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
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[30] bg-background/90 text-on-surface px-6 py-2 rounded-full border border-outline-variant shadow-xl text-sm font-medium backdrop-blur-md">
          {status}
        </div>
      )}

      {/* Map Section */}
      <div className="relative flex-1 rounded-2xl overflow-hidden glass-panel border border-outline-variant shadow-2xl min-h-[400px] z-10">
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
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
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

        {/* Floating Legend */}
        {ndviUrl && (
          <div className="absolute bottom-6 right-6 z-[999] bg-surface/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4 text-on-surface pl-1">
              {t("map.legend_title")}
            </h4>
            <div className="flex flex-col gap-3">
              {NDVI_LEGEND.map(({ color, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-on-surface/90 font-medium tracking-wide">
                  <span
                    className="w-5 h-5 rounded-md shadow-inner border border-black/20"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
