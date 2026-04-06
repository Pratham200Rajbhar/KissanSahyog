"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  state: string | null;
  district: string | null;
  // Climate (NASA)
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  // Soil (GEE)
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  ph: number | null;
  clay: number | null;
  carbon: number | null;
  // Weather (Open-Meteo)
  wind_speed: number | null;
  solar_radiation: number | null;
  // Metadata
  lastUpdated: number | null;
}

interface LocationContextType {
  location: LocationData;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refreshLocation: () => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
}


const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    state: null,
    district: null,
    temperature: null,
    humidity: null,
    rainfall: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    ph: null,
    clay: null,
    carbon: null,
    wind_speed: null,
    solar_radiation: null,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const isRefreshing = React.useRef(false);

  const refreshLocation = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      isRefreshing.current = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 GPS Location identified: Lat ${latitude}, Lon ${longitude} (Accuracy: ${accuracy}m)`);
        
        try {
          const apiUrl = "/api";
          const res = await fetch(`${apiUrl}/geo/reverse?lat=${latitude}&lon=${longitude}`);
          
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Location fetch failed: ${res.status} ${errorText.substring(0, 50)}`);
          }
          
          const data = await res.json();

          setLocation({
            latitude,
            longitude,
            state: data.state !== "Unknown" ? data.state : null,
            district: data.district !== "Unknown" ? data.district : null,
            temperature: data.temperature ?? null,
            humidity: data.humidity ?? null,
            rainfall: data.rainfall ?? null,
            nitrogen: data.nitrogen ?? null,
            phosphorus: data.phosphorus ?? null,
            potassium: data.potassium ?? null,
            ph: data.ph ?? null,
            clay: data.clay ?? null,
            carbon: data.carbon ?? null,
            wind_speed: data.wind_speed ?? null,
            solar_radiation: data.solar_radiation ?? null,
            lastUpdated: Date.now(),
          });
        } catch (err) {
          console.error("Error fetching location details:", err);
          setError("Failed to fetch regional environmental data.");
        } finally {
          setLoading(false);
          isRefreshing.current = false;
        }
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        if (err.code === 1) { // PERMISSION_DENIED
          setPermissionDenied(true);
        } else {
          setError(err.message === "User denied Geolocation" ? "Location access denied. Please enable it for better recommendations." : err.message);
        }
        setLoading(false);
        isRefreshing.current = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  }, []);
 
  const updateLocation = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const apiUrl = "/api";
      const res = await fetch(`${apiUrl}/geo/reverse?lat=${lat}&lon=${lng}`);
      if (!res.ok) throw new Error("Location fetch failed");
      const data = await res.json();
 
      setLocation({
        latitude: lat,
        longitude: lng,
        state: data.state !== "Unknown" ? data.state : null,
        district: data.district !== "Unknown" ? data.district : null,
        temperature: data.temperature ?? null,
        humidity: data.humidity ?? null,
        rainfall: data.rainfall ?? null,
        nitrogen: data.nitrogen ?? null,
        phosphorus: data.phosphorus ?? null,
        potassium: data.potassium ?? null,
        ph: data.ph ?? null,
        clay: data.clay ?? null,
        carbon: data.carbon ?? null,
        wind_speed: data.wind_speed ?? null,
        solar_radiation: data.solar_radiation ?? null,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error("Error manual location update:", err);
      // Fallback but preserve lat/lng
      setLocation(prev => ({ ...prev, latitude: lat, longitude: lng }));
    } finally {
      setLoading(false);
    }
  }, []);


  // Auto-start location fetch on first load to populate the dashboard.
  React.useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);


  return (
    <LocationContext.Provider value={{ location, loading, error, permissionDenied, refreshLocation, updateLocation }}>

      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
