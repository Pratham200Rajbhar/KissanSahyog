I have a React frontend app with a route at /dashboard/map-insights. I have Sentinel Hub (Planet Insights Platform) credentials:

CLIENT_ID = your_client_id

CLIENT_SECRET = your_client_secret
Build a minimal page that:

Authenticates with Sentinel Hub OAuth (services.sentinel-hub.com) using client_credentials

Calls the Process API with a Sentinel-2 L2A NDVI evalscript (bands B04, B08)

Displays the NDVI result as a color-coded map overlay using React Leaflet

Shows a simple NDVI color legend (water → bare soil → low veg → dense forest)

Has a "Load NDVI" button, date range picker, and bbox set to Ahmedabad, India by default
Use: React, Axios, React Leaflet. Store credentials in .env as REACT_APP_SH_CLIENT_ID and REACT_APP_SH_CLIENT_SECRET. Keep it minimal — single page, no Redux, no extra libraries.

cid : f0a8670d-24ce-43dc-a5a2-0f7c6c03d48d

cs: albhfwe0wlp0ZlYqf78PZQGK10Rk3bql