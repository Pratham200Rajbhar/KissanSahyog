"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  state: string | null;
  district: string | null;
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
}

interface LocationContextType {
  location: LocationData;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRefreshing = React.useRef(false);

  const refreshLocation = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    
    setLoading(true);
    setError(null);

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
          // Unified API call to get all location-related data in one request
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
        setError(err.message === "User denied Geolocation" ? "Location access denied. Please enable it for better recommendations." : err.message);
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


  // Auto-start location fetch on first load
  React.useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);


  return (
    <LocationContext.Provider value={{ location, loading, error, refreshLocation }}>
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
