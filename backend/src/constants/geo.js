'use strict';

// Lightweight geo lookup for Indonesian destinations so we can pick the nearest
// branch warehouse without an external maps API. Coordinates are approximate city
// centroids — good enough for choosing the closest origin and zoning shipping cost.

const CITY_COORDS = {
  // Jabodetabek
  'jakarta': { lat: -6.2088, lng: 106.8456 },
  'jakarta pusat': { lat: -6.1751, lng: 106.8275 },
  'jakarta selatan': { lat: -6.2615, lng: 106.8106 },
  'jakarta barat': { lat: -6.1683, lng: 106.7588 },
  'jakarta timur': { lat: -6.2250, lng: 106.9004 },
  'jakarta utara': { lat: -6.1214, lng: 106.7741 },
  'bogor': { lat: -6.5950, lng: 106.8166 },
  'depok': { lat: -6.4025, lng: 106.7942 },
  'tangerang': { lat: -6.1781, lng: 106.6300 },
  'tangerang selatan': { lat: -6.2884, lng: 106.7180 },
  'bekasi': { lat: -6.2383, lng: 106.9756 },
  // Jawa
  'bandung': { lat: -6.9147, lng: 107.6098 },
  'cirebon': { lat: -6.7320, lng: 108.5523 },
  'semarang': { lat: -6.9667, lng: 110.4167 },
  'yogyakarta': { lat: -7.7956, lng: 110.3695 },
  'solo': { lat: -7.5755, lng: 110.8243 },
  'surakarta': { lat: -7.5755, lng: 110.8243 },
  'surabaya': { lat: -7.2575, lng: 112.7521 },
  'malang': { lat: -7.9666, lng: 112.6326 },
  'sidoarjo': { lat: -7.4478, lng: 112.7183 },
  // Sumatera
  'medan': { lat: 3.5952, lng: 98.6722 },
  'palembang': { lat: -2.9761, lng: 104.7754 },
  'pekanbaru': { lat: 0.5071, lng: 101.4478 },
  'padang': { lat: -0.9471, lng: 100.4172 },
  'bandar lampung': { lat: -5.3971, lng: 105.2668 },
  'batam': { lat: 1.0456, lng: 104.0305 },
  // Kalimantan
  'pontianak': { lat: -0.0263, lng: 109.3425 },
  'banjarmasin': { lat: -3.3186, lng: 114.5944 },
  'balikpapan': { lat: -1.2379, lng: 116.8529 },
  'samarinda': { lat: -0.5022, lng: 117.1536 },
  // Sulawesi
  'makassar': { lat: -5.1477, lng: 119.4321 },
  'manado': { lat: 1.4748, lng: 124.8421 },
  // Bali & Nusa Tenggara
  'denpasar': { lat: -8.6705, lng: 115.2126 },
  'mataram': { lat: -8.5833, lng: 116.1167 },
  // Papua
  'jayapura': { lat: -2.5337, lng: 140.7181 },
};

// Province centroids — fallback when the city is unknown.
const PROVINCE_COORDS = {
  'dki jakarta': { lat: -6.2088, lng: 106.8456 },
  'jawa barat': { lat: -6.9147, lng: 107.6098 },
  'banten': { lat: -6.4058, lng: 106.0640 },
  'jawa tengah': { lat: -7.1500, lng: 110.1403 },
  'di yogyakarta': { lat: -7.7956, lng: 110.3695 },
  'jawa timur': { lat: -7.5361, lng: 112.2384 },
  'sumatera utara': { lat: 3.5952, lng: 98.6722 },
  'sumatera selatan': { lat: -2.9761, lng: 104.7754 },
  'sumatera barat': { lat: -0.9471, lng: 100.4172 },
  'riau': { lat: 0.5071, lng: 101.4478 },
  'lampung': { lat: -5.3971, lng: 105.2668 },
  'kalimantan barat': { lat: -0.0263, lng: 109.3425 },
  'kalimantan selatan': { lat: -3.3186, lng: 114.5944 },
  'kalimantan timur': { lat: -1.2379, lng: 116.8529 },
  'sulawesi selatan': { lat: -5.1477, lng: 119.4321 },
  'sulawesi utara': { lat: 1.4748, lng: 124.8421 },
  'bali': { lat: -8.6705, lng: 115.2126 },
  'nusa tenggara barat': { lat: -8.5833, lng: 116.1167 },
  'papua': { lat: -2.5337, lng: 140.7181 },
};

const norm = (s) => (s || '').toString().trim().toLowerCase();

// Resolve coordinates for a destination from its city (preferred) or province.
// Returns null if nothing matches, so callers can degrade gracefully.
function resolveCoords(city, province) {
  const c = norm(city);
  if (c && CITY_COORDS[c]) return CITY_COORDS[c];
  // Try a loose contains match (e.g. "Kota Bandung" -> "bandung")
  if (c) {
    const key = Object.keys(CITY_COORDS).find((k) => c.includes(k) || k.includes(c));
    if (key) return CITY_COORDS[key];
  }
  const p = norm(province);
  if (p && PROVINCE_COORDS[p]) return PROVINCE_COORDS[p];
  if (p) {
    const key = Object.keys(PROVINCE_COORDS).find((k) => p.includes(k) || k.includes(p));
    if (key) return PROVINCE_COORDS[key];
  }
  return null;
}

// Great-circle distance in kilometres.
function haversineKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

module.exports = { CITY_COORDS, PROVINCE_COORDS, resolveCoords, haversineKm };
