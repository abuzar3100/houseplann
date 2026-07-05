// ============================================================================
// PHASE 14B — ROOM INSPECTOR
// Click any room on the model to see its name, dimensions, area, floor level,
// type, and floor finish in a floating tooltip.
//
// Uses invisible click-target planes (one per room) so detection works
// regardless of the current floor-visibility toggle.
// ============================================================================
import * as THREE from 'three';
import { CFG } from '../../config.js';
import { GF_ROOMS, FF_ROOMS } from '../../house/data/rooms.js';
import { getFloorMaterial } from '../../materials/materials.js';

// ---------------------------------------------------------------------------
// Room type → readable category label
// ---------------------------------------------------------------------------
function roomCategory(id, type) {
  if (type === 'pool')   return 'Swimming Pool';
  if (type === 'stair')  return 'Staircase';
  if (type === 'garden') return 'Indoor Garden';
  if (type === 'void')   return 'Double-Height Void';
  if (type === 'balcony') return 'Balcony';
  if (type === 'open') {
    if (/parking/.test(id)) return 'Parking';
    if (/corridor/.test(id) || /ecorr/.test(id)) return 'Corridor';
    if (/westsit/.test(id) || /b3sit/.test(id)) return 'Sit-out';
    if (/pebble/.test(id)) return 'Pebble Court';
    if (/lobby/.test(id)) return 'Lobby';
    return 'Open Area';
  }
  if (/bed\d?$|master$/.test(id))      return 'Bedroom';
  if (/toilet/.test(id))                return 'Bathroom';
  if (/ward/.test(id))                  return 'Wardrobe';
  if (/kitchen/.test(id))               return 'Kitchen';
  if (/dining/.test(id))                return 'Dining Room';
  if (/living/.test(id))                return 'Living Room';
  if (/foyer/.test(id))                 return 'Foyer';
  if (/gym/.test(id))                   return 'Gym';
  if (/lounge/.test(id))                return 'Family Lounge';
  if (/cubical|sitting/.test(id))       return 'Study';
  if (/utility/.test(id))               return 'Utility';
  return 'Room';
}

// ---------------------------------------------------------------------------
// Floor finish → display name (room-ID-based, avoids color-collision bugs)
// ---------------------------------------------------------------------------
function getFinishLabel(id) {
  if (/bed\d?$|master$/.test(id))        return 'Warm Wood';
  if (/ward/.test(id))                    return 'Light Wood';
  if (/toilet/.test(id))                  return 'Ceramic Tile';
  if (/kitchen/.test(id))                 return 'Stone Tile';
  if (/dining/.test(id))                  return 'Polished Marble';
  if (/living/.test(id))                  return 'Polished Marble';
  if (/foyer|lobby/.test(id))             return 'Polished Stone';
  if (/parking/.test(id))                 return 'Rough Concrete';
  if (/corridor/.test(id))                return 'Ceramic Tile';
  if (/gym/.test(id))                     return 'Rubber Sport Floor';
  if (/lounge/.test(id))                  return 'Warm Wood';
  if (/cubical|sitting/.test(id))         return 'Wood';
  if (/balcony/.test(id))                 return 'Outdoor Tile';
  if (/utility/.test(id))                 return 'Concrete';
  if (/stair/.test(id))                   return 'Granite Tread';
  if (/pool/.test(id))                    return 'Water';
  if (/garden/.test(id))                  return 'Soil / Garden';
  if (/pebble|westsit|ecorr|b3sit/.test(id)) return 'Outdoor Tile';
  return 'Concrete';
}

// ---------------------------------------------------------------------------
// Tooltip DOM
// ---------------------------------------------------------------------------
let tooltipEl = null;

function ensureTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'room-tooltip';
    tooltipEl.style.display = 'none';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function showTooltip(x, y, room, floorName) {
  const el = ensureTooltip();
  const cat = roomCategory(room.id, room.type);
  const w = (room.x2 - room.x1).toFixed(1);
  const d = (room.z2 - room.z1).toFixed(1);
  const area = ((room.x2 - room.x1) * (room.z2 - room.z1)).toFixed(0);
  const finish = getFinishLabel(room.id);
  const ceiling = room.dh ? `${CFG.WALL_H * 2}'` : `${CFG.WALL_H}'`;
  const height = room.type === 'pool' ? `-3.2' (pool depth)` : ceiling;

  el.innerHTML = `
    <div class="tip-category">${cat}</div>
    <div class="tip-name">${room.label}</div>
    <div class="tip-grid">
      <div class="tip-cell">
        <span class="tip-val">${w}' × ${d}'</span>
        <span class="tip-lbl">Dimensions</span>
      </div>
      <div class="tip-cell">
        <span class="tip-val">${area}</span>
        <span class="tip-lbl">sq ft</span>
      </div>
      <div class="tip-cell">
        <span class="tip-val">${height}</span>
        <span class="tip-lbl">Height</span>
      </div>
    </div>
    <div class="tip-row">
      <span class="tip-key">Floor</span>
      <span class="tip-val-sm">${floorName}</span>
    </div>
    <div class="tip-row">
      <span class="tip-key">Finish</span>
      <span class="tip-val-sm">${finish}</span>
    </div>
  `;
  el.style.display = 'block';
  // Position: clamp to viewport
  const pad = 16;
  const elW = 220;
  let left = Math.min(x + 14, window.innerWidth - elW - pad);
  let top = Math.min(y - 10, window.innerHeight - 220 - pad);
  if (left < pad) left = pad;
  if (top < pad) top = pad;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

function hideTooltip() {
  const el = ensureTooltip();
  el.style.display = 'none';
}

// ---------------------------------------------------------------------------
// Build invisible click-target planes for every room
// ---------------------------------------------------------------------------
export function buildClickTargets() {
  const group = new THREE.Group();
  group.name = 'click-targets';
  group.visible = true;

  const geom = new THREE.PlaneGeometry(1, 1);
  geom.rotateX(-Math.PI / 2);  // lay flat

  // We create targets at multiple Y heights so clicking walls/furniture also
  // maps to the room below. For simplicity, place a single target at floor level.

  function addRoomTargets(rooms, baseY, floorName) {
    for (const r of rooms) {
      const w = r.x2 - r.x1;
      const d = r.z2 - r.z1;
      if (w < 0.5 || d < 0.5) continue;

      const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({
        transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
      }));
      mesh.position.set((r.x1 + r.x2) / 2, baseY, (r.z1 + r.z2) / 2);
      mesh.scale.set(w, d, 1);
      mesh.userData.roomId = r.id;
      mesh.userData.floorName = floorName;
      group.add(mesh);
    }
  }

  addRoomTargets(GF_ROOMS, 0, 'Ground Floor');
  addRoomTargets(FF_ROOMS, CFG.FF_LEVEL, 'First Floor');

  return group;
}

// ---------------------------------------------------------------------------
// Init inspector — attach click handler to the renderer
// ---------------------------------------------------------------------------
export function initInspector(renderer, scene, camera, clickTargets) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const allRooms = {};
  for (const r of GF_ROOMS) allRooms[r.id] = { ...r, floor: 'Ground Floor' };
  for (const r of FF_ROOMS) allRooms[r.id] = { ...r, floor: 'First Floor' };

  function onPointerClick(event) {
    // Calculate pointer position in NDC
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    // Only intersect click-target planes (invisible)
    const targets = [];
    clickTargets.traverse((child) => {
      if (child.isMesh) targets.push(child);
    });

    const hits = raycaster.intersectObjects(targets, false);
    if (hits.length > 0) {
      const hit = hits[0];
      const roomId = hit.object.userData.roomId;
      const floorName = hit.object.userData.floorName;
      const room = allRooms[roomId];
      if (room) {
        showTooltip(event.clientX, event.clientY, room, floorName);
        return;
      }
    }

    // Clicked empty space → hide tooltip
    hideTooltip();
  }

  renderer.domElement.addEventListener('click', onPointerClick);

  // Hide tooltip on Escape (keyboard)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideTooltip();
  });

  return {
    hideTooltip,
  };
}
