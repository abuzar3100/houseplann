// ============================================================================
// PHASE 9 — FURNITURE
// Low-poly but readable furniture items placed per-room according to the
// arch drawings. Everything is box-based — no complex geometry, just clear
// silhouettes so the space reads correctly at orbit / plan zoom levels.
//
// Each room type has a dedicated builder. The master buildFurniture(rooms, baseY)
// iterates rooms and calls the right builder, returning a single group.
// ============================================================================
import * as THREE from 'three';
import { boxFromBounds } from '../../utils/box.js';

// ---------------------------------------------------------------------------
// Furniture-specific materials (not shared with architecture)
// ---------------------------------------------------------------------------
const M = {
  fabric:       new THREE.MeshStandardMaterial({ color: '#8a9ba8', roughness: 0.85 }),
  fabricAccent: new THREE.MeshStandardMaterial({ color: '#7a8a98', roughness: 0.85 }),
  wood:         new THREE.MeshStandardMaterial({ color: '#8b6f47', roughness: 0.6 }),
  woodLight:    new THREE.MeshStandardMaterial({ color: '#c4a87a', roughness: 0.55 }),
  chrome:       new THREE.MeshStandardMaterial({ color: '#c0c8d0', roughness: 0.15, metalness: 0.9 }),
  marble:       new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.2, metalness: 0.05 }),
  bedding:      new THREE.MeshStandardMaterial({ color: '#e8e0d8', roughness: 0.9 }),
  cushion:      new THREE.MeshStandardMaterial({ color: '#d4c8b8', roughness: 0.85 }),
  pillow:       new THREE.MeshStandardMaterial({ color: '#f0ece4', roughness: 0.9 }),
  wc:           new THREE.MeshStandardMaterial({ color: '#f0ece8', roughness: 0.3, metalness: 0.05 }),
  sink:         new THREE.MeshStandardMaterial({ color: '#ece8e4', roughness: 0.2, metalness: 0.05 }),
  screen:       new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.3, metalness: 0.2 }),
  rug:          new THREE.MeshStandardMaterial({ color: '#6a7a8a', roughness: 0.95 }),
  plant:        new THREE.MeshStandardMaterial({ color: '#4a7a3a', roughness: 0.9 }),
  pot:          new THREE.MeshStandardMaterial({ color: '#8a6a4a', roughness: 0.7 }),
  treadmill:    new THREE.MeshStandardMaterial({ color: '#3a3a4a', roughness: 0.5 }),
  weights:      new THREE.MeshStandardMaterial({ color: '#2a2a3a', roughness: 0.4, metalness: 0.6 }),
  white:        new THREE.MeshStandardMaterial({ color: '#ecece8', roughness: 0.6 }),
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function add(group, mesh) { group.add(mesh); return mesh; }
const cx = (r) => (r.x1 + r.x2) / 2;
const cz = (r) => (r.z1 + r.z2) / 2;

// ---------------------------------------------------------------------------
// BED — double/queen, headboard + mattress + pillows
// ---------------------------------------------------------------------------
function buildBed(group, x, z, yBase, rot = 0) {
  const hw = 3.2, hd = 6.8;   // half-width, half-depth
  // mattress
  add(group, boxFromBounds(x - hw, x + hw, yBase + 0.6, yBase + 1.4, z - hd, z + hd, M.bedding));
  // bed base / frame (visible rim)
  add(group, boxFromBounds(x - hw - 0.15, x + hw + 0.15, yBase + 0.4, yBase + 0.65, z - hd - 0.15, z + hd + 0.15, M.wood));
  // headboard
  add(group, boxFromBounds(x - hw - 0.2, x + hw + 0.2, yBase + 0.4, yBase + 3, z - hd - 0.3, z - hd + 0.2, M.wood));
  // pillows
  add(group, boxFromBounds(x - 1.2, x + 1.2, yBase + 1.4, yBase + 1.8, z - hd + 0.3, z - hd + 1.8, M.pillow));
  add(group, boxFromBounds(x + 1.3, x + 2.8, yBase + 1.4, yBase + 1.8, z - hd + 0.3, z - hd + 1.8, M.pillow));
}

// ---------------------------------------------------------------------------
// BEDSIDE TABLE — small cube + lamp
// ---------------------------------------------------------------------------
function buildBedside(group, x, z, yBase) {
  add(group, boxFromBounds(x - 0.7, x + 0.7, yBase + 0.4, yBase + 2, z - 0.7, z + 0.7, M.wood));
  add(group, boxFromBounds(x - 0.15, x + 0.15, yBase + 2, yBase + 2.6, z - 0.15, z + 0.15, M.chrome));
}

// ---------------------------------------------------------------------------
// WARDROBE — tall box with doors
// ---------------------------------------------------------------------------
function buildWardrobe(group, x1, x2, z1, z2, yBase) {
  const h = 8;
  add(group, boxFromBounds(x1, x2, yBase, yBase + h, z1, z2, M.woodLight));
  // door lines (shallow grooves)
  const midX = (x1 + x2) / 2;
  add(group, boxFromBounds(midX - 0.05, midX + 0.05, yBase + 0.2, yBase + h - 0.2, z1 + 0.05, z2 - 0.05, M.wood));
}

// ---------------------------------------------------------------------------
// SOFA — 3-seater with back + seat + legs
// ---------------------------------------------------------------------------
function buildSofa(group, x1, x2, z, yBase, facing = 1) {
  const w = x2 - x1;
  const d = 2.8;
  const fwd = z + facing * (d / 2);
  const back = z - facing * (d / 2);
  const hSeat = 1.4, hBack = 2.4;
  // seat cushion
  add(group, boxFromBounds(x1 + 0.2, x2 - 0.2, yBase + 0.6, yBase + hSeat, fwd - d / 2 + 0.4, fwd + d / 2 - 0.4, M.fabric));
  // back
  add(group, boxFromBounds(x1 + 0.1, x2 - 0.1, yBase + hSeat, yBase + hBack, fwd - d / 2 - 0.3, fwd - d / 2 + 0.4, M.fabricAccent));
  // armrests
  add(group, boxFromBounds(x1, x1 + 0.5, yBase + 0.6, yBase + hBack - 0.2, fwd - d / 2, fwd + d / 2, M.fabricAccent));
  add(group, boxFromBounds(x2 - 0.5, x2, yBase + 0.6, yBase + hBack - 0.2, fwd - d / 2, fwd + d / 2, M.fabricAccent));
  // legs
  for (const lx of [x1 + 0.5, x2 - 0.5]) add(group, boxFromBounds(lx - 0.1, lx + 0.1, yBase, yBase + 0.6, fwd - d / 2 + 0.2, fwd - d / 2 + 0.4, M.chrome));
  for (const lx of [x1 + 0.5, x2 - 0.5]) add(group, boxFromBounds(lx - 0.1, lx + 0.1, yBase, yBase + 0.6, fwd + d / 2 - 0.4, fwd + d / 2 - 0.2, M.chrome));
}

// ---------------------------------------------------------------------------
// DINING TABLE + CHAIRS
// ---------------------------------------------------------------------------
function buildDiningSet(group, cx, cz, yBase) {
  const tw = 5.5, td = 3.2;
  // table top
  add(group, boxFromBounds(cx - tw / 2, cx + tw / 2, yBase + 2.6, yBase + 2.8, cz - td / 2, cz + td / 2, M.marble));
  // legs at corners
  for (const dx of [-tw / 2 + 0.3, tw / 2 - 0.3])
    for (const dz of [-td / 2 + 0.3, td / 2 - 0.3])
      add(group, boxFromBounds(cx + dx - 0.1, cx + dx + 0.1, yBase, yBase + 2.6, cz + dz - 0.1, cz + dz + 0.1, M.chrome));
  // 4 chairs (two long sides)
  for (const side of [-1, 1]) {
    for (let i = -1; i <= 1; i += 2) {
      const off = i * 1.8;
      buildChair(group, cx + off, cz + side * (td / 2 + 1.2), yBase, side > 0 ? Math.PI : 0);
    }
  }
}

function buildChair(group, x, z, yBase, rotY = 0) {
  const cs = 1.3;   // chair seat half-size
  // seat
  add(group, boxFromBounds(x - cs, x + cs, yBase + 1.4, yBase + 1.7, z - cs, z + cs, M.woodLight));
  // back
  add(group, boxFromBounds(x - cs + 0.1, x + cs - 0.1, yBase + 1.7, yBase + 2.8, z - cs - 0.1, z - cs + 0.2, M.woodLight));
  // 4 legs
  for (const dx of [-cs + 0.2, cs - 0.2])
    for (const dz of [-cs + 0.2, cs - 0.2])
      add(group, boxFromBounds(x + dx - 0.06, x + dx + 0.06, yBase, yBase + 1.4, z + dz - 0.06, z + dz + 0.06, M.chrome));
}

// ---------------------------------------------------------------------------
// COFFEE TABLE
// ---------------------------------------------------------------------------
function buildCoffeeTable(group, x, z, yBase) {
  const tw = 3.5, td = 2;
  add(group, boxFromBounds(x - tw / 2, x + tw / 2, yBase + 1.4, yBase + 1.55, z - td / 2, z + td / 2, M.marble));
  for (const dx of [-tw / 2 + 0.25, tw / 2 - 0.25])
    for (const dz of [-td / 2 + 0.25, td / 2 - 0.25])
      add(group, boxFromBounds(x + dx - 0.08, x + dx + 0.08, yBase, yBase + 1.4, z + dz - 0.08, z + dz + 0.08, M.chrome));
}

// ---------------------------------------------------------------------------
// RUG — thin rectangle on floor
// ---------------------------------------------------------------------------
function buildRug(group, x1, x2, z1, z2, yBase) {
  add(group, boxFromBounds(x1, x2, yBase + 0.02, yBase + 0.08, z1, z2, M.rug));
}

// ---------------------------------------------------------------------------
// TV UNIT — low cabinet + screen
// ---------------------------------------------------------------------------
function buildTVUnit(group, x1, x2, z, yBase) {
  const h = 1.8;
  add(group, boxFromBounds(x1, x2, yBase, yBase + h, z - 0.6, z + 0.6, M.wood));
  // screen
  const sw = (x2 - x1) * 0.7;
  const sc = (x1 + x2) / 2;
  add(group, boxFromBounds(sc - sw / 2, sc + sw / 2, yBase + h + 0.2, yBase + h + 3.2, z - 0.15, z + 0.15, M.screen));
}

// ---------------------------------------------------------------------------
// KITCHEN COUNTER — L-shaped or straight with sink + hob
// ---------------------------------------------------------------------------
function buildKitchenCounter(group, x1, x2, z, yBase, depth = 2) {
  const h = 3;
  // base cabinet
  add(group, boxFromBounds(x1, x2, yBase, yBase + h, z - depth, z, M.white));
  // counter top
  add(group, boxFromBounds(x1, x2, yBase + h - 0.1, yBase + h, z - depth, z, M.marble));
  // sink (dark rectangle)
  const sx = (x1 + x2) / 2;
  add(group, boxFromBounds(sx - 1, sx + 1, yBase + h - 0.08, yBase + h + 0.01, z - depth + 0.3, z - depth + 1.5, M.chrome));
  // hob (darker rectangle)
  add(group, boxFromBounds(sx - 0.8, sx + 0.8, yBase + h - 0.08, yBase + h + 0.01, z - 0.5, z - 0.05, M.screen));
}

// ---------------------------------------------------------------------------
// KITCHEN ISLAND
// ---------------------------------------------------------------------------
function buildIsland(group, x1, x2, z, yBase) {
  const h = 3;
  add(group, boxFromBounds(x1, x2, yBase, yBase + h, z - 1.2, z + 1.2, M.white));
  add(group, boxFromBounds(x1, x2, yBase + h - 0.1, yBase + h, z - 1.2, z + 1.2, M.marble));
}

// ---------------------------------------------------------------------------
// TOILET (WC)
// ---------------------------------------------------------------------------
function buildToilet(group, x, z, yBase) {
  // bowl
  add(group, boxFromBounds(x - 0.5, x + 0.5, yBase + 0.8, yBase + 1.2, z - 0.3, z + 0.5, M.wc));
  // tank
  add(group, boxFromBounds(x - 0.5, x + 0.5, yBase + 1.2, yBase + 2, z - 0.5, z - 0.1, M.wc));
  // seat lid
  add(group, boxFromBounds(x - 0.45, x + 0.45, yBase + 1.2, yBase + 1.25, z - 0.3, z + 0.5, M.woodLight));
}

// ---------------------------------------------------------------------------
// WASHBASIN
// ---------------------------------------------------------------------------
function buildBasin(group, x, z, yBase) {
  add(group, boxFromBounds(x - 0.8, x + 0.8, yBase + 2.4, yBase + 2.6, z - 0.5, z + 0.5, M.marble));
  add(group, boxFromBounds(x - 0.4, x + 0.4, yBase + 2.4, yBase + 2.5, z - 0.25, z + 0.25, M.sink));
  // pedestal
  add(group, boxFromBounds(x - 0.3, x + 0.3, yBase + 0.2, yBase + 2.4, z - 0.25, z + 0.25, M.white));
}

// ---------------------------------------------------------------------------
// SHOWER — glass enclosure frame
// ---------------------------------------------------------------------------
function buildShower(group, x1, x2, z1, z2, yBase) {
  const h = 7;
  const t = 0.08;
  // glass panels (transparent-ish) on 3 sides
  if (x2 - x1 > z2 - z1) {
    // wider along X: panels on X sides + one Z side
    add(group, boxFromBounds(x1, x2, yBase, yBase + h, z1 - t, z1 + t, M.white));
    add(group, boxFromBounds(x1, x2, yBase, yBase + h, z2 - t, z2 + t, M.white));
    add(group, boxFromBounds(x2 - t, x2 + t, yBase, yBase + h, z1, z2, M.white));
  } else {
    add(group, boxFromBounds(x1 - t, x1 + t, yBase, yBase + h, z1, z2, M.white));
    add(group, boxFromBounds(x2 - t, x2 + t, yBase, yBase + h, z1, z2, M.white));
    add(group, boxFromBounds(x1, x2, yBase, yBase + h, z2 - t, z2 + t, M.white));
  }
}

// ---------------------------------------------------------------------------
// EXERCISE EQUIPMENT
// ---------------------------------------------------------------------------
function buildTreadmill(group, x, z, yBase) {
  // base deck
  add(group, boxFromBounds(x - 1.2, x + 1.2, yBase + 0.2, yBase + 0.5, z - 2.5, z + 0.5, M.treadmill));
  // console
  add(group, boxFromBounds(x - 0.8, x + 0.8, yBase + 0.5, yBase + 3, z - 2.5, z - 2, M.treadmill));
  // screen
  add(group, boxFromBounds(x - 0.6, x + 0.6, yBase + 1.5, yBase + 2.8, z - 2.3, z - 2.1, M.screen));
}

function buildWeightsRack(group, x, z, yBase) {
  // frame
  add(group, boxFromBounds(x - 1.5, x + 1.5, yBase + 0.2, yBase + 4, z - 0.2, z + 0.2, M.chrome));
  // weights (dumbbells as small boxes)
  for (let i = 0; i < 3; i++) {
    add(group, boxFromBounds(x - 1.2 + i * 1.2, x - 0.8 + i * 1.2, yBase + 0.5, yBase + 0.9, z - 0.6, z - 0.3, M.weights));
    add(group, boxFromBounds(x - 1.2 + i * 1.2, x - 0.8 + i * 1.2, yBase + 1.2, yBase + 1.6, z - 0.6, z - 0.3, M.weights));
    add(group, boxFromBounds(x - 1.2 + i * 1.2, x - 0.8 + i * 1.2, yBase + 1.9, yBase + 2.3, z - 0.6, z - 0.3, M.weights));
  }
}

// ---------------------------------------------------------------------------
// DESK + CHAIR
// ---------------------------------------------------------------------------
function buildDesk(group, x, z, yBase) {
  const tw = 4, td = 2.2;
  add(group, boxFromBounds(x - tw / 2, x + tw / 2, yBase + 2.4, yBase + 2.55, z - td / 2, z + td / 2, M.wood));
  for (const dx of [-tw / 2 + 0.3, tw / 2 - 0.3])
    for (const dz of [-td / 2 + 0.3, td / 2 - 0.3])
      add(group, boxFromBounds(x + dx - 0.08, x + dx + 0.08, yBase, yBase + 2.4, z + dz - 0.08, z + dz + 0.08, M.chrome));
  // office chair
  buildChair(group, x + 2.5, z, yBase);
}

// ---------------------------------------------------------------------------
// BOOKSHELF
// ---------------------------------------------------------------------------
function buildBookshelf(group, x1, x2, z, yBase) {
  const h = 6, d = 1.2;
  add(group, boxFromBounds(x1, x2, yBase, yBase + h, z - d, z, M.woodLight));
  // shelves (shallow lines)
  for (let i = 1; i <= 5; i++) {
    const sy = yBase + (h / 6) * i;
    add(group, boxFromBounds(x1 + 0.1, x2 - 0.1, sy - 0.05, sy + 0.05, z - d + 0.05, z - 0.05, M.wood));
  }
}

// ---------------------------------------------------------------------------
// PLANTER — pot + plant ball
// ---------------------------------------------------------------------------
function buildPlanter(group, x, z, yBase) {
  add(group, boxFromBounds(x - 0.7, x + 0.7, yBase, yBase + 1.2, z - 0.7, z + 0.7, M.pot));
  // foliage (sphere approximation as 2 crossing boxes)
  const fh = 2.5;
  add(group, boxFromBounds(x - 0.8, x + 0.8, yBase + 1.2, yBase + 1.2 + fh, z - 0.2, z + 0.2, M.plant));
  add(group, boxFromBounds(x - 0.2, x + 0.2, yBase + 1.2, yBase + 1.2 + fh, z - 0.8, z + 0.8, M.plant));
  add(group, boxFromBounds(x - 0.5, x + 0.5, yBase + 1.2, yBase + 1.2 + fh * 0.7, z - 0.5, z + 0.5, M.plant));
}

// ---------------------------------------------------------------------------
// OUTDOOR TABLE + CHAIRS (balcony)
// ---------------------------------------------------------------------------
function buildOutdoorSet(group, cx, cz, yBase) {
  const tw = 3, td = 2.5;
  add(group, boxFromBounds(cx - tw / 2, cx + tw / 2, yBase + 2.2, yBase + 2.35, cz - td / 2, cz + td / 2, M.white));
  for (const dx of [-tw / 2 + 0.3, tw / 2 - 0.3])
    for (const dz of [-td / 2 + 0.3, td / 2 - 0.3])
      add(group, boxFromBounds(cx + dx - 0.08, cx + dx + 0.08, yBase, yBase + 2.2, cz + dz - 0.08, cz + dz + 0.08, M.chrome));
  // 2 chairs
  buildChair(group, cx - 2, cz + 1.8, yBase);
  buildChair(group, cx + 2, cz + 1.8, yBase);
}

// ---------------------------------------------------------------------------
// MASTER BUILDERS — placed by room ID
// ---------------------------------------------------------------------------

function buildMasterBedroom(group, r, yBase) {
  // bed against back wall (Z = r.z1)
  const bz = r.z1 + 4;
  buildBed(group, cx(r), bz, yBase);
  buildBedside(group, cx(r) - 4.5, bz - 3.5, yBase);
  buildBedside(group, cx(r) + 4.5, bz - 3.5, yBase);
  // dresser against Z = r.z2 wall
  add(group, boxFromBounds(cx(r) - 2, cx(r) + 2, yBase + 0.4, yBase + 2.8, r.z2 - 1.8, r.z2 - 0.5, M.wood));
}

function buildBedroom2(group, r, yBase) {
  const bz = r.z1 + 4;
  buildBed(group, cx(r), bz, yBase);
  buildBedside(group, cx(r) - 4, bz - 3.5, yBase);
  buildBedside(group, cx(r) + 4, bz - 3.5, yBase);
}

function buildBedroom3(group, r, yBase) {
  const bz = r.z2 - 4;
  buildBed(group, cx(r), bz, yBase);
  buildBedside(group, cx(r) - 4, bz - 3.5, yBase);
  buildBedside(group, cx(r) + 4, bz - 3.5, yBase);
}

function buildBathroom(group, r, yBase) {
  // WC in one corner, basin opposite
  buildToilet(group, r.x1 + 1.5, r.z1 + 1.5, yBase);
  buildBasin(group, r.x2 - 1.5, r.z2 - 1.5, yBase);
  // shower in remaining corner
  if ((r.x2 - r.x1) > 5 && (r.z2 - r.z1) > 5) {
    buildShower(group, r.x2 - 4, r.x2 - 0.5, r.z1 + 0.5, r.z1 + 3.5, yBase);
  }
}

function buildWardrobeRoom(group, r, yBase) {
  // wardrobes lining the room (along walls)
  if (r.z2 - r.z1 > r.x2 - r.x1) {
    // tall along Z: wardrobes on one X wall
    buildWardrobe(group, r.x1 + 0.3, r.x1 + 2.3, r.z1 + 0.5, r.z2 - 0.5, yBase);
    buildWardrobe(group, r.x1 + 2.6, r.x1 + 4.6, r.z1 + 0.5, r.z2 - 0.5, yBase);
  } else {
    buildWardrobe(group, r.x1 + 0.5, r.x2 - 0.5, r.z1 + 0.3, r.z1 + 2.3, yBase);
    buildWardrobe(group, r.x1 + 0.5, r.x2 - 0.5, r.z1 + 2.6, r.z1 + 4.6, yBase);
  }
}

function buildKitchen(group, r, yBase) {
  // L-shaped counter along west + front walls
  buildKitchenCounter(group, r.x1 + 0.3, r.x1 + 11, r.z1 + 0.5, yBase, 2);
  buildKitchenCounter(group, r.x1 + 0.3, r.x1 + 2.3, r.z1 + 2.8, yBase, 2);
  // island in centre
  const icx = cx(r), icz = cz(r) - 1;
  buildIsland(group, icx - 3, icx + 3, icz, yBase);
}

function buildDining(group, r, yBase) {
  buildDiningSet(group, cx(r), cz(r), yBase);
  // sideboard against wall
  add(group, boxFromBounds(r.x1 + 0.5, r.x1 + 4, yBase + 0.4, yBase + 2.8, r.z2 - 1.5, r.z2 - 0.3, M.wood));
}

function buildLiving(group, r, yBase) {
  // seating area: L-shaped arrangement
  buildSofa(group, r.x1 + 2, r.x1 + 11, r.z2 - 2.5, yBase, -1);        // long sofa facing back
  buildSofa(group, r.x2 - 10, r.x2 - 2, r.z2 - 2.5, yBase, -1);        // second sofa
  buildCoffeeTable(group, cx(r) - 1, r.z2 - 5, yBase);
  buildRug(group, r.x1 + 2, r.x2 - 2, r.z2 - 7, r.z2 - 1.5, yBase);
  // TV unit on the stair-side wall
  buildTVUnit(group, r.x1 + 1, r.x1 + 5, r.z1 + 1, yBase);
  // plant
  buildPlanter(group, r.x1 + 2, r.z1 + 4, yBase);
}

function buildFoyer(group, r, yBase) {
  // console table
  add(group, boxFromBounds(cx(r) - 2, cx(r) + 2, yBase + 0.4, yBase + 2.8, r.z2 - 1.5, r.z2 - 0.3, M.wood));
  // shoe rack
  add(group, boxFromBounds(cx(r) - 3, cx(r) + 3, yBase, yBase + 1.2, r.z1 + 0.5, r.z1 + 2, M.woodLight));
}

function buildGym(group, r, yBase) {
  buildTreadmill(group, r.x1 + 2.5, r.z2 - 3, yBase);
  buildWeightsRack(group, r.x2 - 2, r.z1 + 2.5, yBase);
  // yoga mat on floor
  add(group, boxFromBounds(r.x1 + 1, r.x1 + 3, yBase + 0.05, yBase + 0.1, r.z1 + 2, r.z1 + 5, M.cushion));
}

function buildCubical(group, r, yBase) {
  buildDesk(group, cx(r) - 1.5, cz(r), yBase);
  buildBookshelf(group, r.x2 - 3.5, r.x2 - 0.5, r.z1 + 0.5, yBase);
}

function buildLounge(group, r, yBase) {
  buildSofa(group, r.x1 + 1.5, r.x1 + 8, r.z2 - 2, yBase, -1);
  buildCoffeeTable(group, cx(r), r.z2 - 4.5, yBase);
  buildRug(group, r.x1 + 1.5, r.x2 - 1.5, r.z2 - 6.5, r.z2 - 1.5, yBase);
  buildTVUnit(group, r.x2 - 4.5, r.x2 - 0.5, r.z1 + 1, yBase);
  buildPlanter(group, r.x1 + 1.5, r.z1 + 2, yBase);
}

function buildBalcony(group, r, yBase) {
  // outdoor seating near the front
  buildOutdoorSet(group, r.x1 + 8, r.z2 - 4, yBase);
  buildOutdoorSet(group, r.x1 + 15, r.z2 - 4, yBase);
  // planters along the edge
  for (let x = r.x1 + 3; x < r.x2 - 3; x += 8) {
    buildPlanter(group, x, r.z1 + 1.5, yBase);
  }
  // small side table
  add(group, boxFromBounds(r.x1 + 3, r.x1 + 4, yBase + 1.8, yBase + 2, r.z2 - 2, r.z2 - 1, M.white));
}

// ---------------------------------------------------------------------------
// ROOM DISPATCH — room ID → builder
// ---------------------------------------------------------------------------
const BUILDERS = {
  // Ground floor
  'gf-master':    buildMasterBedroom,
  'gf-mtoilet':   buildBathroom,
  'gf-mward':     buildWardrobeRoom,
  'gf-bed2':      buildBedroom2,
  'gf-b2toilet':  buildBathroom,
  'gf-b2ward':    buildWardrobeRoom,
  'gf-kitchen':   buildKitchen,
  'gf-dining':    buildDining,
  'gf-living':    buildLiving,
  'gf-foyer':     buildFoyer,
  // First floor
  'ff-master':    buildMasterBedroom,
  'ff-mtoilet':   buildBathroom,
  'ff-mward':     buildWardrobeRoom,
  'ff-bed2':      buildBedroom2,
  'ff-b2toilet':  buildBathroom,
  'ff-b2ward':    buildWardrobeRoom,
  'ff-b3toilet':  buildBathroom,
  'ff-b3ward':    buildWardrobeRoom,
  'ff-bed3':      buildBedroom3,
  'ff-gym':       buildGym,
  'ff-cubical':   buildCubical,
  'ff-lounge':    buildLounge,
  'ff-balcony':   buildBalcony,
};

// ---------------------------------------------------------------------------
// MASTER — buildFurniture(rooms, baseY)
// ---------------------------------------------------------------------------
export function buildFurniture(rooms, baseY) {
  const group = new THREE.Group();
  group.name = 'furniture';

  for (const r of rooms) {
    const builder = BUILDERS[r.id];
    if (builder) builder(group, r, baseY);
  }

  return group;
}
