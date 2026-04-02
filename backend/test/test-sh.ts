async function test() {
  try {
    const CLIENT_ID = 'f0a8670d-24ce-43dc-a5a2-0f7c6c03d48d';
    const CLIENT_SECRET = 'albhfwe0wlp0ZlYqf78PZQGK10Rk3bql';

    const authParams = new URLSearchParams();
    authParams.append("grant_type", "client_credentials");
    authParams.append("client_id", CLIENT_ID);
    authParams.append("client_secret", CLIENT_SECRET);

    const tokenRes = await fetch("https://services.sentinel-hub.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: authParams
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    console.log("Token acquired.");
    
    // 2. Fetch Process API
    const processPayload = {
      input: {
        bounds: {
          bbox: [72.4, 22.8, 72.8, 23.2],
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" }
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: { timeRange: { from: "2024-01-01T00:00:00Z", to: "2024-01-31T23:59:59Z" } }
          }
        ]
      },
      output: {
        width: 512,
        height: 512,
        responses: [{ identifier: "default", format: { type: "image/png" } }]
      },
      evalscript: `//VERSION=3
function setup() { return { input: ["B04", "B08", "dataMask"], output: { bands: 4 } }; }
function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  if (sample.dataMask === 0) return [0,0,0,0];
  if (ndvi < -0.2) return [0, 0, 1, 1]; // water
  if (ndvi < 0.1) return [0.6, 0.4, 0.2, 1]; // bare soil
  if (ndvi < 0.4) return [0.6, 0.8, 0.2, 1]; // low veg
  return [0, 0.4, 0, 1]; // dense forest
}`
    };

    const res = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/tar"
      },
      body: JSON.stringify(processPayload)
    });
    
    if (!res.ok) {
        const err = await res.text();
        console.error("SH ERROR:", res.status, err);
        return;
    }
    const buffer = await res.arrayBuffer();
    console.log("SUCCESS! Got image payload of length:", buffer.byteLength);
  } catch (error: any) {
    console.error(error.message);
  }
}

test();

