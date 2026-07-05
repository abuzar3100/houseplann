import * as THREE from 'three';

// Axis-aligned box defined by its min/max bounds on each axis (feet).
export function boxFromBounds(x1, x2, y1, y2, z1, z2, material, { shadow = true } = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(x2 - x1, y2 - y1, z2 - z1),
    material,
  );
  mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  return mesh;
}

export function roomCenter(room) {
  return { x: (room.x1 + room.x2) / 2, z: (room.z1 + room.z2) / 2 };
}
