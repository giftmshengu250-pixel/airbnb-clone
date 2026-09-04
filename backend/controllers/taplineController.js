// node-fetch v3 is ESM-only and cannot be require()'d in a CommonJS project.
// We bootstrap the module once via dynamic import() at startup and reuse the
// resolved function for every request.

let fetchImpl = null;

// Kick off the import immediately so it's ready before the first request.
const fetchReady = (async () => {
  if (typeof globalThis.fetch === "function") {
    // Node 18+ ships native fetch
    fetchImpl = globalThis.fetch.bind(globalThis);
  } else {
    try {
      const mod = await import("node-fetch");
      fetchImpl = mod.default ?? mod;
    } catch (err) {
      console.error("[tapline] Could not load node-fetch:", err.message);
    }
  }
})();

const TAPLINE_BASE = (process.env.TAPLINE_BASE_URL || "https://api.tapline.sh").replace(/\/$/, "");
const TAPLINE_KEY = process.env.TAPLINE_API_KEY || "";
const DEFAULT_CURRENCY = process.env.TAPLINE_CURRENCY || "ZAR";

// Hard-coded city lists for the four requested markets
const CITY_LISTS = {
  US: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"],
  ZA: ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth"],
  FR: ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"],
  JP: ["Tokyo", "Osaka", "Kyoto", "Sapporo", "Nagoya"],
};

// Shared helper: returns auth headers when a key is configured
const taplineHeaders = () => ({
  ...(TAPLINE_KEY ? { Authorization: `Bearer ${TAPLINE_KEY}` } : {}),
  Accept: "application/json",
});

// GET /api/tapline/cities
const getCities = async (_req, res) => {
  res.json(CITY_LISTS);
};

// GET /api/tapline/listings?location=...&country=...&checkIn=...&checkOut=...&guests=...&page=...
const getListings = async (req, res) => {
  try {
    await fetchReady; // ensure fetch is initialised
    if (!fetchImpl) {
      return res.status(500).json({ message: "fetch not available on this server" });
    }

    const { location, country, checkIn, checkOut, guests, page } = req.query;
    const url = new URL(`${TAPLINE_BASE}/listings`);
    if (location) url.searchParams.set("location", location);
    if (country)  url.searchParams.set("country", country);
    if (checkIn)  url.searchParams.set("checkIn", checkIn);
    if (checkOut) url.searchParams.set("checkOut", checkOut);
    if (guests)   url.searchParams.set("guests", guests);
    if (page)     url.searchParams.set("page", page);
    url.searchParams.set("currency", DEFAULT_CURRENCY);

    const resp = await fetchImpl(url.toString(), { headers: taplineHeaders() });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ message: "Tapline error", details: text });
    }

    const data = await resp.json();
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: "Could not reach Tapline", error: error.message });
  }
};

// GET /api/tapline/listings/:id
const getListingById = async (req, res) => {
  try {
    await fetchReady;
    if (!fetchImpl) {
      return res.status(500).json({ message: "fetch not available on this server" });
    }

    const { id } = req.params;
    const url = new URL(`${TAPLINE_BASE}/listings/${encodeURIComponent(id)}`);
    url.searchParams.set("currency", DEFAULT_CURRENCY);

    const resp = await fetchImpl(url.toString(), { headers: taplineHeaders() });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ message: "Tapline error", details: text });
    }

    const data = await resp.json();
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: "Could not reach Tapline", error: error.message });
  }
};

module.exports = { getCities, getListings, getListingById };
