"use server";

import axios from "axios";

export async function getSentinelHubToken() {
  try {
    const CLIENT_ID = process.env.NEXT_PUBLIC_SH_CLIENT_ID || process.env.REACT_APP_SH_CLIENT_ID;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_SH_CLIENT_SECRET || process.env.REACT_APP_SH_CLIENT_SECRET;
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Missing Sentinel Hub credentials in environment");
    }

    const authParams = new URLSearchParams();
    authParams.append("grant_type", "client_credentials");
    authParams.append("client_id", CLIENT_ID);
    authParams.append("client_secret", CLIENT_SECRET);

    const authRes = await axios.post("https://services.sentinel-hub.com/oauth/token", authParams, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    
    return authRes.data.access_token;
  } catch (error) {
    console.error("Failed to fetch SH token server-side:", error);
    throw new Error("Failed to get token");
  }
}
