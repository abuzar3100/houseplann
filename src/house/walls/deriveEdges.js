// ============================================================================
// WALL SCHEDULE — derived from the authoritative room geometry using a proper
// grid/cell-edge scan (handles T-junctions & partial overlaps correctly).
//
// Method: build the set of X and Z gridlines from every walled room edge. For
// each candidate wall cell-edge, sample the room on each side:
//   • room on BOTH sides (different rooms) -> INTERIOR partition (4½")
//   • room on ONE side only                -> EXTERIOR wall (9")
//   • same room / open space on both sides -> no wall
// Collinear same-kind, same-height segments are then merged into single walls.
//
// Returns: [{ o:'V'|'H', a, lo, hi, kind:'ext'|'int', height }]
// ============================================================================
import { CFG } from '../../config.js';

const WALLED = new Set([undefined, 'room', 'stair']);
const uniq = (arr) => [...new Set(arr.map((v) => Math.round(v * 100) / 100))].sort((a, b) => a - b);

export function deriveWallEdges(rooms) {
  const walled = rooms.filter((r) => WALLED.has(r.type));
  const xs = uniq(walled.flatMap((r) => [r.x1, r.x2]));
  const zs = uniq(walled.flatMap((r) => [r.z1, r.z2]));
  const EPS = 0.05;

  const roomAt = (x, z) =>
    walled.find((r) => x > r.x1 && x < r.x2 && z > r.z1 && z < r.z2) || null;
  const hOf = (r) => (r ? (r.dh ? CFG.DH_H : CFG.WALL_H) : 0);

  const raw = [];

  // vertical walls: fixed X = gx, across each Z cell
  for (const gx of xs) {
    for (let i = 0; i < zs.length - 1; i++) {
      const z0 = zs[i], z1 = zs[i + 1], mz = (z0 + z1) / 2;
      const L = roomAt(gx - EPS, mz), R = roomAt(gx + EPS, mz);
      if (L === R) continue;                       // open/open or same room -> no wall
      raw.push({ o: 'V', a: gx, lo: z0, hi: z1,
        kind: L && R ? 'int' : 'ext', height: Math.max(hOf(L), hOf(R)) });
    }
  }

  // horizontal walls: fixed Z = gz, across each X cell
  for (const gz of zs) {
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i], x1 = xs[i + 1], mx = (x0 + x1) / 2;
      const B = roomAt(mx, gz - EPS), F = roomAt(mx, gz + EPS);
      if (B === F) continue;
      raw.push({ o: 'H', a: gz, lo: x0, hi: x1,
        kind: B && F ? 'int' : 'ext', height: Math.max(hOf(B), hOf(F)) });
    }
  }

  return mergeCollinear(raw);
}

// Merge adjacent segments that share orientation, line, kind and height.
function mergeCollinear(segs) {
  const groups = new Map();
  for (const s of segs) {
    const k = `${s.o}|${s.a}|${s.kind}|${s.height}`;
    (groups.get(k) || groups.set(k, []).get(k)).push(s);
  }
  const out = [];
  for (const list of groups.values()) {
    list.sort((a, b) => a.lo - b.lo);
    let cur = { ...list[0] };
    for (let i = 1; i < list.length; i++) {
      if (list[i].lo <= cur.hi + 0.01) cur.hi = Math.max(cur.hi, list[i].hi);
      else { out.push(cur); cur = { ...list[i] }; }
    }
    out.push(cur);
  }
  return out;
}
