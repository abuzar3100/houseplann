// ============================================================================
// PHASE 12 — WALK MODE
// First-person controls with PointerLockControls, AABB wall collision (with
// door‑sized gaps), and REAL staircase climbing using stair.stepBoxes.
// WASD = move · Shift = sprint · Click to lock pointer · Esc to unlock.
// ============================================================================
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CFG } from '../config.js';
import { GF_ROOMS, FF_ROOMS } from '../house/data/rooms.js';
import { deriveWallEdges } from '../house/walls/deriveEdges.js';
import { GF_DOORS, FF_DOORS } from '../house/doors/doorSchedule.js';

const PLAYER_H = 5.5;     // eye height (ft)
const PLAYER_R = 1;       // collision radius
const WALK_SPEED = 12;    // ft/s
const RUN_SPEED = 22;     // ft/s (hold Shift)
const FLY_SPEED = 30;     // ft/s (creative fly)
const STEP_H = 1.4;       // max auto-climbable step height (ft)
const GRAVITY = 34;       // ft/s²
const JUMP_V = 13;        // jump velocity (Space)
const DBL_TAP = 300;      // ms window for double-tap Space -> toggle fly

// ---------------------------------------------------------------------------
// Build collision AABBs from wall edges, skipping door openings
// Returns: [{ x1,x2, z1,z2 }]  (all at Y = player walk height range)
// ---------------------------------------------------------------------------
function buildCollisionBoxes() {
  const boxes = [];
  const EPS = 0.05;
  const t = 0.4;   // collision thickness for walls

  // Process each floor
  const floors = [
    { rooms: GF_ROOMS, doors: GF_DOORS, baseY: 0 },
    { rooms: FF_ROOMS, doors: FF_DOORS, baseY: CFG.FF_LEVEL },
  ];

  for (const floor of floors) {
    const edges = deriveWallEdges(floor.rooms);
    for (const e of edges) {
      // Build the full-wall box
      if (e.o === 'V') {
        boxes.push({ x1: e.a - t / 2, x2: e.a + t / 2, z1: e.lo, z2: e.hi,
          yBot: floor.baseY, yTop: floor.baseY + e.height });
      } else {
        boxes.push({ x1: e.lo, x2: e.hi, z1: e.a - t / 2, z2: e.a + t / 2,
          yBot: floor.baseY, yTop: floor.baseY + e.height });
      }
    }

    // Subtract door openings (split boxes at each opening)
    for (const d of floor.doors) {
      const dw = 0.5;     // door opening extra width for passage
      for (let i = boxes.length - 1; i >= 0; i--) {
        const b = boxes[i];
        // Check if this box is on the same wall line as the door
        if (d.o === 'V' && Math.abs(d.a - (b.x1 + b.x2) / 2) < 0.2) {
          // Vertical wall: door spans along Z
          const dStart = d.at - dw / 2;
          const dEnd = d.at + d.width + dw / 2;
          if (dStart < b.z2 && dEnd > b.z1) {
            // Split: keep left and right parts
            const left = { ...b };
            const right = { ...b };
            left.z2 = dStart;
            right.z1 = dEnd;
            boxes.splice(i, 1);
            if (left.z2 > left.z1 + 0.2) boxes.push(left);
            if (right.z2 > right.z1 + 0.2) boxes.push(right);
          }
        } else if (d.o === 'H' && Math.abs(d.a - (b.z1 + b.z2) / 2) < 0.2) {
          // Horizontal wall: door spans along X
          const dStart = d.at - dw / 2;
          const dEnd = d.at + d.width + dw / 2;
          if (dStart < b.x2 && dEnd > b.x1) {
            const left = { ...b };
            const right = { ...b };
            left.x2 = dStart;
            right.x1 = dEnd;
            boxes.splice(i, 1);
            if (left.x2 > left.x1 + 0.2) boxes.push(left);
            if (right.x2 > right.x1 + 0.2) boxes.push(right);
          }
        }
      }
    }
  }
  return boxes;
}

// ---------------------------------------------------------------------------
// Circle-vs-AABB collision (XZ plane only)
// ---------------------------------------------------------------------------
function collideCircle(x, z, r, box) {
  const cx = Math.max(box.x1, Math.min(x, box.x2));
  const cz = Math.max(box.z1, Math.min(z, box.z2));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < r * r;
}

function resolveCollision(px, pz, r, boxes) {
  let x = px, z = pz;
  for (const b of boxes) {
    if (!collideCircle(x, z, r, b)) continue;
    // Push out along the shortest axis
    const overlapX = Math.min(x - b.x1 + r, b.x2 - x + r);
    const overlapZ = Math.min(z - b.z1 + r, b.z2 - z + r);
    if (overlapX < overlapZ) {
      if (x < (b.x1 + b.x2) / 2) x = b.x1 - r;
      else x = b.x2 + r;
    } else {
      if (z < (b.z1 + b.z2) / 2) z = b.z1 - r;
      else z = b.z2 + r;
    }
  }
  return { x, z };
}

// ---------------------------------------------------------------------------
// Support height under the player: highest surface (room floor or stair tread)
// whose top is reachable (≤ feet + STEP_H). Allows stepping UP and DOWN, so
// stairs climb and descend smoothly. Returns ground level if nothing found.
// ---------------------------------------------------------------------------
function supportHeight(px, pz, feetY, stepBoxes, floorSurfaces) {
  let best = -0.5;                                  // outside ground level
  const M = 0.3;                                    // xz margin
  const consider = (s) => {
    if (px > s.x1 - M && px < s.x2 + M && pz > s.z1 - M && pz < s.z2 + M
        && s.top <= feetY + STEP_H && s.top > best) best = s.top;
  };
  for (const s of stepBoxes) consider(s);
  for (const s of floorSurfaces) consider(s);
  return best;
}

// ---------------------------------------------------------------------------
// Build floor surfaces from room data (so the player can stand on rooms)
// Returns: [{ x1,x2, z1,z2, top }]  compatible with stepBoxes
// ---------------------------------------------------------------------------
function buildFloorSurfaces() {
  const surfaces = [];
  // Ground floor
  for (const r of GF_ROOMS) {
    if (r.type === 'void' || r.type === 'pool') continue;
    surfaces.push({ x1: r.x1, x2: r.x2, z1: r.z1, z2: r.z2, top: 0 });
  }
  // First floor — skip the stair well so you can descend through it
  for (const r of FF_ROOMS) {
    if (r.type === 'void' || r.type === 'pool' || r.type === 'stair') continue;
    surfaces.push({ x1: r.x1, x2: r.x2, z1: r.z1, z2: r.z2, top: CFG.FF_LEVEL });
  }
  return surfaces;
}


// ---------------------------------------------------------------------------
// WalkMode controller
// ---------------------------------------------------------------------------
export function createWalkMode(camera, renderer, stairSteps) {
  let active = false;

  // PointerLockControls handles mouse look
  const controls = new PointerLockControls(camera, renderer.domElement);

  // Build collision geometry once
  const collisionBoxes = buildCollisionBoxes();
  const floorSurfaces = buildFloorSurfaces();

  // Player state
  const pos = new THREE.Vector3(32, 0, 34);   // start: front yard / foyer area
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const keys = { w: false, a: false, s: false, d: false, shift: false, space: false };
  let mode = 'walk';        // 'walk' | 'fly'
  let velY = 0;             // vertical velocity (walk gravity/jump)
  let grounded = false;
  let lastSpace = 0;        // for double-tap fly toggle

  // DOM elements
  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  // Key listeners
  function onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': keys.w = true; break;
      case 'KeyA': keys.a = true; break;
      case 'KeyS': keys.s = true; break;
      case 'KeyD': keys.d = true; break;
      case 'ShiftLeft': case 'ShiftRight': keys.shift = true; break;
      case 'Space': {
        e.preventDefault();
        const t = performance.now();
        if (t - lastSpace < DBL_TAP) {          // double-tap Space toggles fly
          mode = mode === 'fly' ? 'walk' : 'fly';
          velY = 0;
        }
        lastSpace = t;
        keys.space = true;
        break;
      }
    }
  }
  function onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': keys.w = false; break;
      case 'KeyA': keys.a = false; break;
      case 'KeyS': keys.s = false; break;
      case 'KeyD': keys.d = false; break;
      case 'ShiftLeft': case 'ShiftRight': keys.shift = false; break;
      case 'Space': keys.space = false; break;
    }
  }

  // Resize handler
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  // Clock for delta time
  const clock = new THREE.Clock();

  function update() {
    if (!active) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const flying = mode === 'fly';

    // --- directions (mouse-driven) ---
    const yaw = camera.rotation.y;
    const flat = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));   // horizontal forward
    // fly follows the FULL look vector (mouse pitch + yaw); walk stays flat
    const fwd = flying ? camera.getWorldDirection(new THREE.Vector3()) : flat;
    const rightV = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const speed = (flying ? FLY_SPEED : (keys.shift ? RUN_SPEED : WALK_SPEED)) * dt;

    let dx = 0, dy = 0, dz = 0;
    if (keys.w) { dx += fwd.x * speed; dy += fwd.y * speed; dz += fwd.z * speed; }
    if (keys.s) { dx -= fwd.x * speed; dy -= fwd.y * speed; dz -= fwd.z * speed; }
    if (keys.a) { dx -= rightV.x * speed; dz -= rightV.z * speed; }
    if (keys.d) { dx += rightV.x * speed; dz += rightV.z * speed; }

    if (flying) {
      pos.x += dx; pos.z += dz;                        // no wall clip while flying
      let vy = dy;                                     // vertical from look direction
      if (keys.space) vy += FLY_SPEED * dt;            // + Space up
      if (keys.shift) vy -= FLY_SPEED * dt;            // + Shift down
      pos.y += vy;
      const ground = supportHeight(pos.x, pos.z, pos.y, stairSteps, floorSurfaces);
      if (pos.y < ground) pos.y = ground;              // can't sink through floor
    } else {
      if (dx !== 0 || dz !== 0) {
        pos.x = resolveCollision(pos.x + dx, pos.z, PLAYER_R, collisionBoxes).x;
        pos.z = resolveCollision(pos.x, pos.z + dz, PLAYER_R, collisionBoxes).z;
      }
      const ground = supportHeight(pos.x, pos.z, pos.y, stairSteps, floorSurfaces);
      if (keys.space && grounded) { velY = JUMP_V; grounded = false; }   // jump
      velY -= GRAVITY * dt;
      pos.y += velY * dt;
      if (pos.y <= ground) { pos.y = ground; velY = 0; grounded = true; } // land / auto-step
      else grounded = false;
    }

    camera.position.set(pos.x, pos.y + PLAYER_H, pos.z);
  }

  // Public API
  return {
    start() {
      if (active) return;
      active = true;
      velY = 0; grounded = false; mode = 'walk';

      // Set camera position to player position
      camera.position.set(pos.x, pos.y + PLAYER_H, pos.z);
      camera.rotation.set(0, 0, 0);
      camera.fov = 60;
      camera.updateProjectionMatrix();

      // Lock pointer
      controls.lock();

      // Hide UI, show blocker
      if (blocker) blocker.style.display = 'flex';
      if (instructions) instructions.style.display = '';

      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onResize);

      clock.start();
    },

    stop() {
      if (!active) return;
      active = false;

      controls.unlock();

      // Show UI, hide blocker
      if (blocker) blocker.style.display = 'none';
      if (instructions) instructions.style.display = 'none';

      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);

      // Reset camera for orbit controls
      camera.fov = 45;
      camera.updateProjectionMatrix();
    },

    toggle() {
      if (active) this.stop();
      else this.start();
      return active;
    },

    update,
    get isActive() { return active; },
    get mode() { return mode; },
    get position() { return pos; },
    controls,
    collisionBoxes,
  };
}
