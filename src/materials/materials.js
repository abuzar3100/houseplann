// ============================================================================
// PHASE 8 — CENTRAL PBR MATERIALS
// Every material lives here as a SINGLETON so multiple meshes share the same
// material instance (GPU draw-call optimisation). Import the materials you
// need; never create a MeshStandardMaterial inline elsewhere.
// ============================================================================
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// WALLS
// ---------------------------------------------------------------------------
export const MAT_WALL_EXT = new THREE.MeshStandardMaterial({
  color: '#e4ddd2', roughness: 0.85,
});
export const MAT_WALL_INT = new THREE.MeshStandardMaterial({
  color: '#ece7e0', roughness: 0.75,
});

// ---------------------------------------------------------------------------
// FLOOR FINISHES — mapped by room type via getFloorMaterial()
// ---------------------------------------------------------------------------
export const MAT_FLOOR_BEDROOM  = new THREE.MeshStandardMaterial({ color: '#c49a6c', roughness: 0.65 });               // warm wood
export const MAT_FLOOR_WARDROBE = new THREE.MeshStandardMaterial({ color: '#d4a87a', roughness: 0.6 });                // light wood
export const MAT_FLOOR_TILE     = new THREE.MeshStandardMaterial({ color: '#c8d8e8', roughness: 0.35, metalness: 0.05 }); // ceramic
export const MAT_FLOOR_KITCHEN  = new THREE.MeshStandardMaterial({ color: '#d4c8b0', roughness: 0.5, metalness: 0.05 });  // stone tile
export const MAT_FLOOR_DINING   = new THREE.MeshStandardMaterial({ color: '#e8e0d4', roughness: 0.25, metalness: 0.05 }); // polished marble
export const MAT_FLOOR_LIVING   = new THREE.MeshStandardMaterial({ color: '#d8d0c8', roughness: 0.2, metalness: 0.08 });  // polished marble
export const MAT_FLOOR_FOYER    = new THREE.MeshStandardMaterial({ color: '#d0c8bc', roughness: 0.3, metalness: 0.05 });  // polished stone
export const MAT_FLOOR_CORRIDOR = new THREE.MeshStandardMaterial({ color: '#cad2d8', roughness: 0.5 });                  // tile
export const MAT_FLOOR_CONCRETE = new THREE.MeshStandardMaterial({ color: '#b8c0c8', roughness: 0.9 });                 // rough concrete
export const MAT_FLOOR_OUTDOOR  = new THREE.MeshStandardMaterial({ color: '#d0ccc4', roughness: 0.75 });                // outdoor tile
export const MAT_FLOOR_WOOD     = new THREE.MeshStandardMaterial({ color: '#d4a87a', roughness: 0.55 });                // sitting-room wood
export const MAT_FLOOR_GYM      = new THREE.MeshStandardMaterial({ color: '#d47670', roughness: 0.8 });                 // rubber sport floor
export const MAT_FLOOR_BALCONY  = new THREE.MeshStandardMaterial({ color: '#c4b8d8', roughness: 0.7 });                 // outdoor tile
export const MAT_FLOOR_LOUNGE   = new THREE.MeshStandardMaterial({ color: '#d4a87a', roughness: 0.55 });                // lounge wood
export const MAT_FLOOR_UTILITY  = new THREE.MeshStandardMaterial({ color: '#d4d8dc', roughness: 0.85 });                // concrete
export const MAT_FLOOR_STAIR    = new THREE.MeshStandardMaterial({ color: '#c9c4bc', roughness: 0.45 });                // granite treads

export const MAT_POOL_WATER     = new THREE.MeshStandardMaterial({
  color: '#4fc3f7', roughness: 0.1, transparent: true, opacity: 0.55, metalness: 0.05,
});
export const MAT_GARDEN_SOIL    = new THREE.MeshStandardMaterial({ color: '#8aad7a', roughness: 0.95 });

/** Map any room object → the right floor-material singleton. */
export function getFloorMaterial(room) {
  const id = room.id;
  const type = room.type;

  if (type === 'pool')   return MAT_POOL_WATER;
  if (type === 'garden') return MAT_GARDEN_SOIL;
  if (type === 'stair')  return MAT_FLOOR_STAIR;

  if (/bed\d?$|master$/.test(id))               return MAT_FLOOR_BEDROOM;
  if (/ward/.test(id))                           return MAT_FLOOR_WARDROBE;
  if (/toilet/.test(id))                         return MAT_FLOOR_TILE;
  if (/kitchen/.test(id))                        return MAT_FLOOR_KITCHEN;
  if (/dining/.test(id))                         return MAT_FLOOR_DINING;
  if (/living/.test(id))                         return MAT_FLOOR_LIVING;
  if (/foyer|lobby/.test(id))                    return MAT_FLOOR_FOYER;
  if (/parking/.test(id))                        return MAT_FLOOR_CONCRETE;
  if (/corridor/.test(id))                       return MAT_FLOOR_CORRIDOR;
  if (/gym/.test(id))                            return MAT_FLOOR_GYM;
  if (/lounge/.test(id))                         return MAT_FLOOR_LOUNGE;
  if (/cubical|sitting/.test(id))                return MAT_FLOOR_WOOD;
  if (/balcony/.test(id))                        return MAT_FLOOR_BALCONY;
  if (/utility/.test(id))                        return MAT_FLOOR_UTILITY;
  if (type === 'open' || /pebble|westsit|ecorr|b3sit/.test(id)) return MAT_FLOOR_OUTDOOR;

  return MAT_FLOOR_CONCRETE;                   // fallback
}

// ---------------------------------------------------------------------------
// DOORS
// ---------------------------------------------------------------------------
export const MAT_DOOR_MAIN  = new THREE.MeshStandardMaterial({ color: '#3f2d20', roughness: 0.35, metalness: 0.05 });
export const MAT_DOOR_LEAF  = new THREE.MeshStandardMaterial({ color: '#6d4c33', roughness: 0.5 });
export const MAT_DOOR_FRAME = new THREE.MeshStandardMaterial({ color: '#4e3626', roughness: 0.55 });

// ---------------------------------------------------------------------------
// WINDOWS
// ---------------------------------------------------------------------------
export const MAT_GLASS     = new THREE.MeshStandardMaterial({
  color: '#bcd6e6', roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.35,
});
export const MAT_WIN_FRAME = new THREE.MeshStandardMaterial({ color: '#6a7680', roughness: 0.4, metalness: 0.5 });

// ---------------------------------------------------------------------------
// STAIRCASE
// ---------------------------------------------------------------------------
export const MAT_STEP    = new THREE.MeshStandardMaterial({ color: '#c9c4bc', roughness: 0.45 });
export const MAT_LANDING = new THREE.MeshStandardMaterial({ color: '#b8b2a8', roughness: 0.5 });
export const MAT_RAILING = new THREE.MeshStandardMaterial({ color: '#6a7885', roughness: 0.3, metalness: 0.7 });
export const MAT_NEWEL   = new THREE.MeshStandardMaterial({ color: '#4a5560', roughness: 0.3, metalness: 0.6 });

// ---------------------------------------------------------------------------
// ROOF
// ---------------------------------------------------------------------------
export const MAT_ROOF_SLAB  = new THREE.MeshStandardMaterial({ color: '#9aa1a6', roughness: 0.9 });
export const MAT_ROOF_PARA  = new THREE.MeshStandardMaterial({ color: '#d9d4c8', roughness: 0.85 });
export const MAT_ROOF_TANK  = new THREE.MeshStandardMaterial({ color: '#c8ccce', roughness: 0.35, metalness: 0.3 });
export const MAT_ROOF_STEEL = new THREE.MeshStandardMaterial({ color: '#7d858c', roughness: 0.4, metalness: 0.7 });
export const MAT_ROOF_SOLAR = new THREE.MeshStandardMaterial({ color: '#1b2a4a', roughness: 0.25, metalness: 0.3 });
export const MAT_ROOF_PIPE  = new THREE.MeshStandardMaterial({ color: '#7d858c', roughness: 0.55 });

// ---------------------------------------------------------------------------
// GROUND / LANDSCAPE
// ---------------------------------------------------------------------------
export const MAT_GROUND = new THREE.MeshStandardMaterial({ color: '#b7d9a0', roughness: 0.95 });
