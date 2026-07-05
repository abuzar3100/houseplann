// ============================================================================
// ROOM GEOMETRY — measured from the FINAL APPROVED drawings
// (GF PLAN OPT 01 AFSAR.pdf / FF PLAN OPT 01 AFSAR.pdf), pixel-calibrated to
// the 64x40 plot. This is the single source of truth for room extents.
//
// Each room: { id, label, x1, x2, z1, z2, color, type }
//   type: 'room'   -> enclosed space (walls added in Phase 3)
//         'stair'  -> staircase footprint
//         'open'   -> sit-outs / corridors / parking / court (slab only)
//         'garden' -> indoor garden
//         'pool'   -> swimming pool (recessed)
//         'void'   -> double-height opening (no slab on first floor)
//         'balcony'-> open balcony (slab + railing, no roof)
//   dh: true       -> double-height volume (20ft walls)
// ============================================================================
import { COLORS as C } from '../../config.js';

// -------- GROUND FLOOR (baseline Y = 0) --------
export const GF_ROOMS = [
  { id:'gf-westsit',  label:'West Sit-out',    x1:0,  x2:4,    z1:2,    z2:19,   color:C.open,     type:'open' },
  { id:'gf-utility',  label:'Utility',         x1:0,  x2:4,    z1:19,   z2:36.5, color:C.utility,  type:'open' },

  // Master suite: wardrobe/toilet strip X4-13, bedroom X13-25 (12'x16')
  { id:'gf-mward',    label:'M. Wardrobe',     x1:4,  x2:13,   z1:2,    z2:13,   color:C.wardrobe },
  { id:'gf-mtoilet',  label:'M. Toilet',       x1:4,  x2:13,   z1:13,   z2:19,   color:C.toilet },
  { id:'gf-master',   label:'Master Bedroom',  x1:13, x2:25,   z1:2,    z2:19,   color:C.bedroom },

  { id:'gf-stair',    label:'Staircase',       x1:25, x2:34,   z1:2,    z2:19,   color:C.stair,    type:'stair' },

  // Bedroom 2 suite (11'-6"x16') + service strip X46-52
  { id:'gf-bed2',     label:'Bedroom 2',       x1:34, x2:46,   z1:2,    z2:19,   color:C.bedroom },
  { id:'gf-b2toilet', label:'B2 Toilet',       x1:46, x2:52,   z1:2,    z2:8,    color:C.toilet },
  { id:'gf-b2ward',   label:'B2 Wardrobe',     x1:46, x2:52,   z1:8,    z2:19,   color:C.wardrobe },

  // Kitchen / Dining
  { id:'gf-kitchen',  label:'Kitchen',         x1:4,  x2:16,   z1:19,   z2:36.5, color:C.kitchen },
  { id:'gf-dining',   label:'Dining',          x1:16, x2:25,   z1:19,   z2:36.5, color:C.dining },
  { id:'gf-pebble',   label:'Pebble Court',    x1:16, x2:25,   z1:36.5, z2:39.5, color:C.open,     type:'open' },

  // Living — DOUBLE HEIGHT (17'x16'-7½")
  { id:'gf-living',   label:'Living',          x1:25, x2:42,   z1:19,   z2:36.5, color:C.living,   dh:true },

  // Indoor garden (5'-3" deep) + Foyer / entrance
  { id:'gf-garden',   label:'Indoor Garden',   x1:42, x2:52,   z1:19,   z2:24.4, color:C.garden,   type:'garden' },
  { id:'gf-foyer',    label:'Foyer',           x1:42, x2:52,   z1:24.4, z2:36.5, color:C.foyer },

  // East wing
  { id:'gf-pool',     label:'Swimming Pool',   x1:52, x2:60.5, z1:2,    z2:20,   color:C.pool,     type:'pool' },
  { id:'gf-ecorr',    label:'East Corridor',   x1:60.5, x2:64, z1:2,    z2:20,   color:C.corridor, type:'open' },
  { id:'gf-parking',  label:'Parking',         x1:52, x2:64,   z1:20,   z2:36.5, color:C.parking,  type:'open' },
];

// -------- FIRST FLOOR (baseline Y = FF_LEVEL) --------
export const FF_ROOMS = [
  { id:'ff-westsit',  label:'West Sit-out',    x1:0,  x2:4,    z1:2,    z2:36.5, color:C.open,     type:'open' },

  // Master suite — same footprint as GF
  { id:'ff-mward',    label:'M. Wardrobe',     x1:4,  x2:13,   z1:2,    z2:13,   color:C.wardrobe },
  { id:'ff-mtoilet',  label:'M. Toilet',       x1:4,  x2:13,   z1:13,   z2:19,   color:C.toilet },
  { id:'ff-master',   label:'Master Bedroom',  x1:13, x2:25,   z1:2,    z2:19,   color:C.bedroom },

  { id:'ff-stair',    label:'Staircase',       x1:25, x2:34,   z1:2,    z2:19,   color:C.stair,    type:'stair' },

  // Bedroom 2 suite
  { id:'ff-bed2',     label:'Bedroom 2',       x1:34, x2:46,   z1:2,    z2:19,   color:C.bedroom },
  { id:'ff-b2toilet', label:'B2 Toilet',       x1:46, x2:52,   z1:2,    z2:9.5,  color:C.toilet },
  { id:'ff-b2ward',   label:'B2 Wardrobe',     x1:46, x2:52,   z1:9.5,  z2:19,   color:C.wardrobe },

  // Bedroom 3 suite (15'x11'-3")
  { id:'ff-b3toilet', label:'B3 Toilet',       x1:4,  x2:12,   z1:19,   z2:24,   color:C.toilet },
  { id:'ff-b3ward',   label:'B3 Wardrobe',     x1:12, x2:19,   z1:19,   z2:24,   color:C.wardrobe },  // 6'-7½" walk-in (was mislabeled 'Landing')
  { id:'ff-bed3',     label:'Bedroom 3',       x1:4,  x2:19,   z1:24,   z2:36.5, color:C.bedroom },
  { id:'ff-b3sit',    label:'B3 Sit-out',      x1:4,  x2:19,   z1:36.5, z2:39.5, color:C.open,     type:'open' },

  // Circulation spine + gym
  { id:'ff-corridor', label:'Corridor',        x1:19, x2:25,   z1:19,   z2:31,   color:C.corridor, type:'open' },
  { id:'ff-gym',      label:'Gym',             x1:19, x2:25,   z1:31,   z2:36.5, color:C.gym },

  // Double-height living void + first-floor lobby over the foyer
  { id:'ff-livvoid',  label:'Living Void',     x1:25, x2:42,   z1:19,   z2:31,   color:C.void,     type:'void' },
  { id:'ff-lobby',    label:'Lobby',           x1:42, x2:52,   z1:19,   z2:31,   color:C.foyer,    type:'open' },

  // East wing
  { id:'ff-cubical',  label:'Cubical Sitting', x1:52, x2:62,   z1:2,    z2:18.5, color:C.sitting },
  { id:'ff-ecorr',    label:'East Corridor',   x1:62, x2:64,   z1:2,    z2:31,   color:C.corridor, type:'open' },
  { id:'ff-lounge',   label:'Family Lounge',   x1:52, x2:62,   z1:18.5, z2:31,   color:C.lounge },

  // Front balcony (20'-9"x8'-6")
  { id:'ff-balcony',  label:'Balcony',         x1:25, x2:52,   z1:31,   z2:39.5, color:C.balcony,  type:'balcony' },
];

// Double-height living void rectangle (railing on the first-floor edge)
export const LIVING_VOID = { x1:25, x2:42, z1:19, z2:31 };
