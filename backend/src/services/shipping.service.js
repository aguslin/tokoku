const db = require('../models');
const { resolveCoords, haversineKm } = require('../constants/geo');

const { Warehouse, Inventory, Courier, CourierService, Product } = db;

// Per-km rate (Rp) by service tier — instant costs more per km than reguler,
// so a nearer warehouse meaningfully lowers ongkir (UAT #7).
const PER_KM_RATE = { instant: 35, reguler: 12 };
const PER_KG_RATE = { instant: 4000, reguler: 2000 };
const FALLBACK_DISTANCE_COST = { instant: 20000, reguler: 8000 };

const roundTo = (n, step) => Math.round(n / step) * step;

// Compute total billable weight (kg) for the ordered items.
const computeWeightKg = async (items) => {
  if (!items || !items.length) return 0;
  const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  if (!ids.length) return 0;
  const products = await Product.findAll({
    where: { id: ids },
    attributes: ['id', 'weight', 'weightUom'],
  });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  let kg = 0;
  for (const item of items) {
    const p = byId[item.productId];
    if (!p || p.weight == null) continue;
    const w = Number(p.weight) || 0;
    const inKg = p.weightUom === 'gram' ? w / 1000 : w;
    kg += inKg * (Number(item.quantity) || 1);
  }
  return kg;
};

// Decide which warehouse the order ships from: the nearest active warehouse that
// can fulfil the items; fall back to nearest with partial stock, then nearest overall.
const selectOriginWarehouse = async (destCoords, items) => {
  const warehouses = await Warehouse.findAll({ where: { isActive: true } });
  if (!warehouses.length) return null;

  const productIds = [...new Set((items || []).map((i) => i.productId).filter(Boolean))];
  let invByWarehouse = {};
  if (productIds.length) {
    const inv = await Inventory.findAll({
      where: { productId: productIds, isActive: true },
      attributes: ['warehouseId', 'productId', 'quantity', 'reservedQuantity'],
    });
    for (const row of inv) {
      const available = (Number(row.quantity) || 0) - (Number(row.reservedQuantity) || 0);
      invByWarehouse[row.warehouseId] = invByWarehouse[row.warehouseId] || {};
      invByWarehouse[row.warehouseId][row.productId] =
        (invByWarehouse[row.warehouseId][row.productId] || 0) + available;
    }
  }

  const need = {};
  for (const item of items || []) {
    if (!item.productId) continue;
    need[item.productId] = (need[item.productId] || 0) + (Number(item.quantity) || 1);
  }

  const scored = warehouses.map((w) => {
    const coords = w.latitude != null && w.longitude != null
      ? { lat: Number(w.latitude), lng: Number(w.longitude) }
      : null;
    const distanceKm = destCoords && coords ? haversineKm(coords, destCoords) : null;

    const stock = invByWarehouse[w.id] || {};
    let fulfilledLines = 0;
    const neededLines = Object.keys(need).length;
    for (const [pid, qty] of Object.entries(need)) {
      if ((stock[pid] || 0) >= qty) fulfilledLines += 1;
    }
    const fulfills = neededLines > 0 && fulfilledLines === neededLines;
    const hasSomeStock = fulfilledLines > 0;
    return { warehouse: w, distanceKm, fulfills, hasSomeStock };
  });

  // Sort by distance (unknown distance sinks to the end).
  const byDistance = (a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  };

  const fulfilling = scored.filter((s) => s.fulfills).sort(byDistance);
  if (fulfilling.length) return fulfilling[0];

  const partial = scored.filter((s) => s.hasSomeStock).sort(byDistance);
  if (partial.length) return partial[0];

  return scored.slice().sort(byDistance)[0];
};

const etaText = (cs) => {
  const a = cs.estimatedDaysMin;
  const b = cs.estimatedDaysMax;
  if (a == null && b == null) return null;
  if (a === 0 && (b === 0 || b === 1)) return 'Hari ini / besok';
  if (a === b) return `${a} hari`;
  return `${a}-${b} hari`;
};

const buildOption = (cs, distanceKm, weightKg) => {
  const tier = cs.code === 'instant' ? 'instant' : 'reguler';
  const base = Number(cs.cost) || 0;
  const distanceCost = distanceKm != null
    ? Math.round(distanceKm * PER_KM_RATE[tier])
    : FALLBACK_DISTANCE_COST[tier];
  const billableKg = Math.max(1, Math.ceil(weightKg || 0));
  const weightCost = (billableKg - 1) * PER_KG_RATE[tier];
  const cost = Math.max(base, roundTo(base + distanceCost + weightCost, 500));
  return {
    courierServiceId: cs.id,
    courierId: cs.courierId,
    courier: cs.Courier ? cs.Courier.name : null,
    courierCode: cs.Courier ? cs.Courier.code : null,
    service: cs.name,
    code: cs.code, // 'reguler' | 'instant'
    tier,
    eta: etaText(cs),
    estimatedDaysMin: cs.estimatedDaysMin,
    estimatedDaysMax: cs.estimatedDaysMax,
    cost,
  };
};

// Main entry: produce a shipping quote with the chosen origin warehouse and
// a list of Reguler / Instan options with distance-aware costs.
const getQuote = async ({ city, province, items }) => {
  const destCoords = resolveCoords(city, province);
  const weightKg = await computeWeightKg(items);
  const origin = await selectOriginWarehouse(destCoords, items);
  const distanceKm = origin ? origin.distanceKm : null;

  const services = await CourierService.findAll({
    where: { isActive: true },
    include: [{ model: Courier, as: 'Courier', where: { isActive: true }, attributes: ['id', 'name', 'code'] }],
  });

  const options = services
    .map((cs) => buildOption(cs, distanceKm, weightKg))
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === 'reguler' ? -1 : 1; // reguler first
      return a.cost - b.cost;
    });

  return {
    destination: {
      city: city || null,
      province: province || null,
      resolved: !!destCoords,
    },
    origin: origin
      ? {
          warehouseId: origin.warehouse.id,
          name: origin.warehouse.name,
          city: origin.warehouse.city,
          province: origin.warehouse.province,
          distanceKm: distanceKm != null ? Math.round(distanceKm) : null,
          fulfills: origin.fulfills,
        }
      : null,
    totalWeightKg: Math.round(weightKg * 1000) / 1000,
    options,
  };
};

// Public list of couriers and their services (for display / admin).
const listCouriersWithServices = async () => {
  const couriers = await Courier.findAll({
    where: { isActive: true },
    include: [{
      model: CourierService,
      as: 'CourierServices',
      where: { isActive: true },
      required: false,
      attributes: ['id', 'name', 'code', 'cost', 'estimatedDaysMin', 'estimatedDaysMax'],
    }],
    order: [['name', 'ASC']],
  });
  return couriers;
};

module.exports = { getQuote, listCouriersWithServices, selectOriginWarehouse, computeWeightKg };
