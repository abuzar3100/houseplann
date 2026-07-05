// ============================================================================
// PHASE 13 — GEOMETRY MERGE UTILITY
// Merges all meshes that share the same material within a given group into
// a single mesh per material. This drastically reduces GPU draw calls.
//
// Uses manual BufferGeometry merging (no external deps) to stay compatible
// across all three.js versions.
// ============================================================================
import * as THREE from 'three';

/**
 * Manually merge an array of BufferGeometry into a single BufferGeometry
 * by concatenating position/normal/uv/index attributes.
 */
function manualMergeGeometries(geoms) {
  if (geoms.length === 0) return null;
  if (geoms.length === 1) return geoms[0];

  // Collect all attributes by key
  const attrMap = new Map();
  let totalVerts = 0;
  let totalIdx = 0;
  const indexArrays = [];

  for (const g of geoms) {
    const pos = g.getAttribute('position');
    if (!pos) continue;
    const nVerts = pos.count;

    for (const key of Object.keys(g.attributes)) {
      const attr = g.getAttribute(key);
      if (!attrMap.has(key)) {
        // Clone the first item's config
        const itemSize = attr.itemSize;
        const isIdx = key === 'index';
        const ctor = isIdx ? (attr.array?.constructor || Uint16Array) : attr.array?.constructor || Float32Array;
        attrMap.set(key, { itemSize, ctor, arrays: [] });
      }
      attrMap.get(key).arrays.push(attr.array);
    }

    // Handle index (triangulation)
    const idx = g.getIndex();
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indexArrays.push(idx.getX(i) + totalVerts);
      }
    }
    totalVerts += nVerts;
  }

  // Build merged geometry
  const merged = new THREE.BufferGeometry();

  for (const [key, info] of attrMap.entries()) {
    const totalLen = info.arrays.reduce((s, a) => s + a.length, 0);
    const result = new info.ctor(totalLen);
    let offset = 0;
    for (const arr of info.arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    merged.setAttribute(key, new THREE.BufferAttribute(result, info.itemSize));
  }

  // Set index
  if (indexArrays.length > 0) {
    const idxArray = totalVerts > 65535 ? new Uint32Array(indexArrays) : new Uint16Array(indexArrays);
    merged.setIndex(new THREE.BufferAttribute(idxArray, 1));
  }

  merged.computeVertexNormals();
  return merged;
}

/**
 * Walk `group`, collect all Mesh children, group them by material,
 * merge each group's geometries into a single mesh, and replace the
 * originals. Skips children with `.userData.skipMerge === true`.
 */
export function mergeGroupStatic(renderer, group, label) {
  // Flatten the tree: collect meshes
  const meshes = [];
  group.traverse((child) => {
    if (child.isMesh && !child.userData.skipMerge) {
      meshes.push(child);
    }
  });

  if (meshes.length === 0) return;

  // Group by material identity (shared singleton → same instance)
  const byMat = new Map();
  for (const m of meshes) {
    const mat = m.material;
    if (!byMat.has(mat)) byMat.set(mat, []);
    byMat.get(mat).push(m);
  }

  // Build merged meshes
  const merged = [];
  for (const [material, srcMeshes] of byMat.entries()) {
    if (srcMeshes.length === 1) {
      merged.push(srcMeshes[0]);
      continue;
    }

    // Bake world transforms into geometry
    const geoms = srcMeshes.map((m) => {
      const g = m.geometry.clone();
      m.updateWorldMatrix(true, false);
      g.applyMatrix4(m.matrixWorld);
      return g;
    });

    const castShadow = srcMeshes[0].castShadow;
    const receiveShadow = srcMeshes[0].receiveShadow;

    try {
      const mergedGeom = manualMergeGeometries(geoms);
      const mergedMesh = new THREE.Mesh(mergedGeom, material);
      mergedMesh.castShadow = castShadow;
      mergedMesh.receiveShadow = receiveShadow;
      // Geometry is in world-space, mesh at origin
      mergedMesh.position.set(0, 0, 0);
      mergedMesh.matrixAutoUpdate = false;
      mergedMesh.updateMatrix();
      merged.push(mergedMesh);
    } catch (e) {
      console.warn('[Optimise] Merge failed for', material, e);
      for (const m of srcMeshes) merged.push(m);
    }

    // Dispose old geometries and remove from parent
    for (const m of srcMeshes) {
      m.geometry.dispose();
      if (m.parent) m.parent.remove(m);
    }
  }

  // Add merged meshes to the group
  for (const m of merged) {
    group.add(m);
  }

  // Report
  if (label) {
    const reduction = meshes.length - merged.length;
    const pct = ((reduction / meshes.length) * 100).toFixed(0);
    console.log(`[Optimise] ${label}: ${meshes.length} → ${merged.length} meshes (-${pct}%)`);
  }
}
