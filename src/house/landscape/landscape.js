// ============================================================================
// PHASE 10 — LANDSCAPE
// Compound boundary wall + gates, driveway, pool deck + steps, parking columns,
// indoor garden, and planting / trees around the plot.
// ============================================================================
import * as THREE from 'three';
import { CFG } from '../../config.js';
import { boxFromBounds } from '../../utils/box.js';

// ---------------------------------------------------------------------------
// Landscape-specific materials
// ---------------------------------------------------------------------------
const M = {
  wall:     new THREE.MeshStandardMaterial({ color: '#d9d4c8', roughness: 0.85 }),
  pillar:   new THREE.MeshStandardMaterial({ color: '#c9c0b0', roughness: 0.75 }),
  gate:     new THREE.MeshStandardMaterial({ color: '#3a4048', roughness: 0.4, metalness: 0.6 }),
  pedGate:  new THREE.MeshStandardMaterial({ color: '#4a5058', roughness: 0.4, metalness: 0.5 }),
  driveway: new THREE.MeshStandardMaterial({ color: '#a0a8b0', roughness: 0.9 }),
  deckTile: new THREE.MeshStandardMaterial({ color: '#c8c0b4', roughness: 0.7 }),
  pebble:   new THREE.MeshStandardMaterial({ color: '#9a9084', roughness: 0.95 }),
  planter:  new THREE.MeshStandardMaterial({ color: '#7a6a5a', roughness: 0.8 }),
  soil:     new THREE.MeshStandardMaterial({ color: '#6a5a4a', roughness: 0.95 }),
  trunk:    new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.9 }),
  canopy:   new THREE.MeshStandardMaterial({ color: '#4a7a3a', roughness: 0.9 }),
  canopyDk: new THREE.MeshStandardMaterial({ color: '#3a6a2a', roughness: 0.9 }),
  column:   new THREE.MeshStandardMaterial({ color: '#c8c4bc', roughness: 0.8 }),
  roofSlab: new THREE.MeshStandardMaterial({ color: '#9aa1a6', roughness: 0.9 }),
  poolCope: new THREE.MeshStandardMaterial({ color: '#d4c8b8', roughness: 0.6 }),
  canvas:   new THREE.MeshStandardMaterial({ color: '#7a8a9a', roughness: 0.85 }),
};

function add(group, mesh) { group.add(mesh); return mesh; }

// ---------------------------------------------------------------------------
// 1. BOUNDARY WALL — around the full plot perimeter (X0-64, Z0-40)
//    Skips the front gate + pedestrian gate gap.
// ---------------------------------------------------------------------------
function buildBoundaryWall(group) {
  const h = CFG.BOUNDARY_H;
  const t = 0.4;             // wall thickness
  const t2 = t / 2;
  const W = CFG.PLOT_W, D = CFG.PLOT_D;

  // Left wall (X=0, Z=0..40)
  add(group, boxFromBounds(-t2, t2, 0, h, 0, D, M.wall));
  // Right wall (X=64, Z=0..40)
  add(group, boxFromBounds(W - t2, W + t2, 0, h, 0, D, M.wall));
  // Back wall (Z=0, X=0..64)
  add(group, boxFromBounds(0, W, 0, h, -t2, t2, M.wall));
  // Front wall — two segments with gate gap (gate centered at X=32)
  const gateCx = W / 2;
  const gw = CFG.GATE_W;
  const pgw = CFG.PED_GATE_W;
  const gap = gw + pgw + 1.5;   // gate + pedestrian gate + pillar between them

  // front left section: X=0 → gateCx - gap/2
  add(group, boxFromBounds(0, gateCx - gap / 2, 0, h, D - t2, D + t2, M.wall));
  // front right section: X=gateCx + gap/2 → W
  add(group, boxFromBounds(gateCx + gap / 2, W, 0, h, D - t2, D + t2, M.wall));
}

// ---------------------------------------------------------------------------
// 2. GATES — main gate + pedestrian gate at front (Z=40)
// ---------------------------------------------------------------------------
function buildGates(group) {
  const gateCx = CFG.PLOT_W / 2;   // X=32
  const gw = CFG.GATE_W;           // main gate width
  const pgw = CFG.PED_GATE_W;      // pedestrian gate width
  const z = CFG.PLOT_D;            // Z=40

  // Main gate pillars (left & right of the main gate opening)
  const ph = 9, ps = 1.2;   // pillar height, section
  const leftPillarX = gateCx - gw / 2 - ps;
  const rightPillarX = gateCx + gw / 2;

  // Left pillar
  add(group, boxFromBounds(leftPillarX, leftPillarX + ps, 0, ph, z - 0.8, z + 0.8, M.pillar));
  // Right pillar (between main gate and pedestrian gate)
  add(group, boxFromBounds(rightPillarX, rightPillarX + ps, 0, ph, z - 0.8, z + 0.8, M.pillar));

  // Main gate leaves (metal, decorative bars)
  const gh = 6;   // gate height
  const gt = 0.15;
  // Left leaf
  add(group, boxFromBounds(gateCx - gw / 2 + 0.3, gateCx - 0.3, 0.3, gh, z - 0.1, z + gt, M.gate));
  // Right leaf
  add(group, boxFromBounds(gateCx + 0.3, gateCx + gw / 2 - 0.3, 0.3, gh, z - 0.1, z + gt, M.gate));
  // Top rail across both leaves
  add(group, boxFromBounds(gateCx - gw / 2 + 0.3, gateCx + gw / 2 - 0.3, gh - 0.15, gh, z - 0.1, z + gt, M.gate));
  // Bottom rail
  add(group, boxFromBounds(gateCx - gw / 2 + 0.3, gateCx + gw / 2 - 0.3, 0.3, 0.5, z - 0.1, z + gt, M.gate));
  // Vertical bars
  for (let x = gateCx - gw / 2 + 1; x <= gateCx + gw / 2 - 1; x += 1.8) {
    add(group, boxFromBounds(x - 0.06, x + 0.06, 0.3, gh, z - 0.05, z + gt + 0.05, M.gate));
  }

  // Pedestrian gate pillar (right of pedestrian gate)
  const pedRightX = gateCx + gw / 2 + ps + pgw;
  add(group, boxFromBounds(gateCx + gw / 2 + ps + 0.3, gateCx + gw / 2 + ps + 0.3 + ps, 0, 7, z - 0.6, z + 0.6, M.pillar));

  // Pedestrian gate leaf
  add(group, boxFromBounds(gateCx + gw / 2 + ps + 0.8, gateCx + gw / 2 + ps + pgw - 0.3, 0.3, 5.5, z - 0.1, z + gt, M.pedGate));

  // Gate canopy/beam above main gate
  add(group, boxFromBounds(leftPillarX - 0.3, gateCx + gw / 2 + ps + 0.3, ph - 0.5, ph, z - 1, z + 1, M.pillar));
}

// ---------------------------------------------------------------------------
// 3. DRIVEWAY — from main gate to parking area
// ---------------------------------------------------------------------------
function buildDriveway(group) {
  // From main gate (X=27-37, Z=40) to parking (X=52-64, Z=20-36.5)
  // Main drive: wide strip from gate to east side
  // Gate center is at X=32, parking starts at X=52
  // Drive curves: X27..37 at Z=40, narrowing to X52..64 at Z=20

  // Main approach (paver strip from gate inward)
  add(group, boxFromBounds(27, 37, -0.1, 0.05, 36.5, 40, M.driveway));

  // Drive turning east toward parking
  add(group, boxFromBounds(37, 52, -0.1, 0.05, 33, 37, M.driveway));

  // Drive to parking
  add(group, boxFromBounds(50, 64, -0.1, 0.05, 25, 34, M.driveway));

  // Parking area pavement (inside the parking zone)
  add(group, boxFromBounds(52, 64, -0.1, 0.05, 20, 25, M.driveway));
}

// ---------------------------------------------------------------------------
// 4. POOL DECK — coping, steps, and surrounding deck
// ---------------------------------------------------------------------------
function buildPoolDeck(group) {
  // Pool is at X52-60.5, Z2-20
  // Deck/coping around the pool edge — 1.5ft wide
  const px1 = 51.5, px2 = 61, pz1 = 1.5, pz2 = 20.5;

  // Deck slabs around the pool perimeter
  // Left edge
  add(group, boxFromBounds(px1, 52, -0.05, 0.1, pz1, pz2, M.deckTile));
  // Right edge
  add(group, boxFromBounds(60.5, px2, -0.05, 0.1, pz1, pz2, M.deckTile));
  // Top edge
  add(group, boxFromBounds(51.5, 60.5, -0.05, 0.1, pz1, 2, M.deckTile));
  // Bottom edge
  add(group, boxFromBounds(51.5, 60.5, -0.05, 0.1, 19.5, pz2, M.deckTile));

  // Pool steps (at the top/north end, Z=2 side)
  // 3 steps descending into the pool
  for (let i = 0; i < 3; i++) {
    const stepZ = 2.5 + i * 1.2;
    const stepH = -0.5 - i * 1.0;
    add(group, boxFromBounds(54, 58, stepH - 0.15, stepH + 0.05, stepZ, stepZ + 1, M.deckTile));
  }

  // Lounge chairs (simple boxes) on the deck
  for (let i = 0; i < 3; i++) {
    const cx = 56 + (i - 1) * 2.5;
    add(group, boxFromBounds(cx - 1, cx + 1, 0.2, 0.5, 3.5, 6.5, M.deckTile));
    add(group, boxFromBounds(cx - 0.9, cx + 0.9, 0.5, 1.2, 3.5, 6.5, M.canvas));
  }
}

// ---------------------------------------------------------------------------
// 5. PARKING COLUMNS + ROOF
// ---------------------------------------------------------------------------
function buildParkingStructure(group) {
  // Parking spans X52-64, Z20-36.5
  // 4 columns + light roof slab
  const colH = 8;
  const cs = 0.8;   // column section

  for (const cx of [54, 62]) {
    for (const cz of [22, 34]) {
      add(group, boxFromBounds(cx - cs / 2, cx + cs / 2, 0, colH, cz - cs / 2, cz + cs / 2, M.column));
    }
  }

  // Light roof slab over parking
  add(group, boxFromBounds(52.5, 63.5, colH, colH + 0.5, 20.5, 35.5, M.roofSlab));
}

// ---------------------------------------------------------------------------
// 6. INDOOR GARDEN — planter, pebbles, plants
//    gf-garden: X42-52, Z19-24.4
// ---------------------------------------------------------------------------
function buildIndoorGarden(group) {
  const gx1 = 42, gx2 = 52, gz1 = 19, gz2 = 24.4;

  // Soil/pebble bed
  add(group, boxFromBounds(gx1 + 0.5, gx2 - 0.5, -0.1, 0.05, gz1 + 0.5, gz2 - 0.5, M.soil));
  // Top pebble layer
  add(group, boxFromBounds(gx1 + 0.5, gx2 - 0.5, 0.05, 0.1, gz1 + 0.5, gz2 - 0.5, M.pebble));

  // Planter along the back wall
  add(group, boxFromBounds(gx1 + 0.8, gx2 - 0.8, 0, 1.2, gz1 + 0.5, gz1 + 2, M.planter));

  // Small plants in the planter (3 box-balls)
  for (let x = gx1 + 2; x < gx2 - 1; x += 3.5) {
    add(group, boxFromBounds(x - 0.6, x + 0.6, 1.2, 2.8, gz1 + 1.2, gz1 + 1.8, M.canopy));
  }

  // Decorative pebble path through garden
  add(group, boxFromBounds(gx1 + 2, gx2 - 2, 0.08, 0.12, gz1 + 3, gz1 + 4, M.pebble));
}

// ---------------------------------------------------------------------------
// 7. TREES & SHRUBS — along the boundary and in open areas
// ---------------------------------------------------------------------------
function buildPlanting(group) {
  // Trees along the left boundary (X=1-3, spaced out)
  const treePositions = [
    [2, 4], [2, 12], [2, 22], [2, 30],       // left side
    [62, 4], [62, 12], [62, 22],              // right side
    [8, 38], [18, 38],                        // front yard
    [10, 3], [20, 3], [38, 3], [48, 3],       // backyard
  ];

  for (const [tx, tz] of treePositions) {
    // Trunk
    add(group, boxFromBounds(tx - 0.2, tx + 0.2, 0, 4, tz - 0.2, tz + 0.2, M.trunk));
    // Canopy (crossing boxes for a ball shape)
    const ch = 3.5;
    const cs2 = 1.8;
    add(group, boxFromBounds(tx - cs2, tx + cs2, 4, 4 + ch, tz - 0.3, tz + 0.3, M.canopy));
    add(group, boxFromBounds(tx - 0.3, tx + 0.3, 4, 4 + ch, tz - cs2, tz + cs2, M.canopy));
    add(group, boxFromBounds(tx - cs2 * 0.7, tx + cs2 * 0.7, 4, 4 + ch * 0.6, tz - cs2 * 0.7, tz + cs2 * 0.7, M.canopyDk));
  }

  // Shrubs along the front wall (between wall and driveway)
  const shrubPositions = [
    [4, 38.5], [12, 38.5], [22, 38.5], [44, 38.5], [50, 38.5], [58, 38.5],
  ];
  for (const [sx, sz] of shrubPositions) {
    add(group, boxFromBounds(sx - 0.8, sx + 0.8, 0.2, 2, sz - 0.8, sz + 0.8, M.canopyDk));
  }
}

// ---------------------------------------------------------------------------
// MASTER — buildLandscape()
// ---------------------------------------------------------------------------
export function buildLandscape() {
  const group = new THREE.Group();
  group.name = 'landscape';

  buildBoundaryWall(group);
  buildGates(group);
  buildDriveway(group);
  buildPoolDeck(group);
  buildParkingStructure(group);
  buildIndoorGarden(group);
  buildPlanting(group);

  return group;
}
