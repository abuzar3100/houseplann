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
const RUN_SPEED = 24;     // ft/s
const STEP_H = 1.2;       // max climbable step height (ft)

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
// Stair climbing — check if player should step up onto a tread
// ---------------------------------------------------------------------------
function checkStairs(px, pz, py, stepBoxes) {
  let newY = py;
  for (const s of stepBoxes) {
    // Check XZ overlap (with some margin)
    if (px > s.x1 - 0.5 && px < s.x2 + 0.5 && pz > s.z1 - 0.5 && pz < s.z2 + 0.5) {
      const stepTop = s.top;
      const diff = stepTop - py;
      // Only step up (not down), within max step height, and not already on top
      if (diff > 0.05 && diff < STEP_H && py < stepTop - 0.05) {
        newY = Math.max(newY, stepTop);
      }
    }
  }
  return newY;
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
  // First floor
  for (const r of FF_ROOMS) {
    if (r.type === 'void' || r.type === 'pool') continue;
    surfaces.push({ x1: r.x1, x2: r.x2, z1: r.z1, z2: r.z2, top: CFG.FF_LEVEL });
  }
  return surfaces;
}

// ---------------------------------------------------------------------------
// Floor snapping — check room surfaces + stair treads
// ---------------------------------------------------------------------------
function snapToFloor(px, pz, py, stepBoxes, floorSurfaces) {
  let floorY = -0.5;   // default: ground level
  // Check stair treads
  for (const s of stepBoxes) {
    if (px > s.x1 - 0.3 && px < s.x2 + 0.3 && pz > s.z1 - 0.3 && pz < s.z2 + 0.3) {
      if (s.top > floorY && s.top <= py + 0.1) {
        floorY = s.top;
      }
    }
  }
  // Check room floor surfaces
  for (const s of floorSurfaces) {
    if (px > s.x1 && px < s.x2 && pz > s.z1 && pz < s.z2) {
      if (s.top > floorY && s.top <= py + 0.1) {
        floorY = s.top;
      }
    }
  }
  return floorY;
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
  const keys = { w: false, a: false, s: false, d: false, shift: false };

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
    }
  }
  function onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': keys.w = false; break;
      case 'KeyA': keys.a = false; break;
      case 'KeyS': keys.s = false; break;
      case 'KeyD': keys.d = false; break;
      case 'ShiftLeft': case 'ShiftRight': keys.shift = false; break;
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

    const delta = Math.min(clock.getDelta(), 0.05);  // cap delta
    const speed = keys.shift ? RUN_SPEED : WALK_SPEED;
    const moveDist = speed * delta;

    // Direction from camera euler
    const yaw = camera.rotation.y;
    const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    let dx = 0, dz = 0;
    if (keys.w) { dx += fwd.x * moveDist; dz += fwd.z * moveDist; }
    if (keys.s) { dx -= fwd.x * moveDist; dz -= fwd.z * moveDist; }
    if (keys.a) { dx -= right.x * moveDist; dz -= right.z * moveDist; }
    if (keys.d) { dx += right.x * moveDist; dz += right.z * moveDist; }

    if (dx === 0 && dz === 0) return;

    // Try X movement with collision
    let nx = pos.x + dx;
    let nz = pos.z;
    const resolvedX = resolveCollision(nx, nz, PLAYER_R, collisionBoxes);
    nx = resolvedX.x;
    nz = resolvedX.z;

    // Try Z movement with collision
    nz = pos.z + dz;
    const resolvedZ = resolveCollision(nx, nz, PLAYER_R, collisionBoxes);
    nx = resolvedZ.x;
    nz = resolvedZ.z;

    pos.x = nx;
    pos.z = nz;

    // Stair climbing
    pos.y = checkStairs(pos.x, pos.z, pos.y, stairSteps);

    // Floor snapping (room surfaces + stair treads)
    const floorY = snapToFloor(pos.x, pos.z, pos.y, stairSteps, floorSurfaces);
    if (pos.y < floorY + PLAYER_H - 0.05) {
      pos.y = Math.max(pos.y, floorY);
    }

    // Apply position
    camera.position.set(pos.x, pos.y + PLAYER_H, pos.z);
  }

  // Public API
  return {
    start() {
      if (active) return;
      active = true;

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

    get isActive() { return active; },
    get position() { return pos; },
    controls,
    collisionBoxes,
  };
}
