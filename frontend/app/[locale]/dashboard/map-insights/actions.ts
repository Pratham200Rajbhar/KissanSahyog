"use server";

import axios from "axios";

export async function getSentinelHubToken() {
  try {
    const CLIENT_ID = process.env.KISSAN_SH_CLIENT_ID;
    const CLIENT_SECRET = process.env.KISSAN_SH_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.warn("Sentinel Hub credentials missing. Satellite features will be disabled.");
      return null;
    }

    const authParams = new URLSearchParams();
    authParams.append("grant_type", "client_credentials");
    authParams.append("client_id", CLIENT_ID);
    authParams.append("client_secret", CLIENT_SECRET);

    const TOKEN_URL = process.env.NEXT_PUBLIC_KISSAN_SENTINEL_HUB_OAUTH_URL || "https://services.sentinel-hub.com/oauth/token";
    const authRes = await axios.post(TOKEN_URL, authParams, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return authRes.data.access_token;
  } catch (error) {
    console.error("Failed to fetch SH token server-side:", error);
    throw new Error("Failed to get token");
  }
}
