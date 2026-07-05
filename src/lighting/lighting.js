// ============================================================================
// PHASE 11 — HDRI ENVIRONMENT + SUN + INTERIOR LIGHTS + NIGHT MODE
// Returns a lighting controller { setDayMode, setNightMode, toggle, lights }
// that main.js can use to switch between day and night.
// ============================================================================
import * as THREE from 'three';
import { CFG } from '../config.js';
import { START_TARGET } from '../camera/camera.js';
import { GF_ROOMS, FF_ROOMS } from '../house/data/rooms.js';

// ---------------------------------------------------------------------------
// 1. Procedural HDRI environment (PMREMGenerator + canvas gradient)
// ---------------------------------------------------------------------------
export function addEnvironment(scene, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  // Generate an HDR-ish equirectangular texture from a canvas gradient
  const w = 1024, h = 512;
  const cnv = document.createElement('canvas');
  cnv.width = w; cnv.height = h;
  const ctx = cnv.getContext('2d');

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0.0, '#87b5da');
  skyGrad.addColorStop(0.3, '#b8d6ed');
  skyGrad.addColorStop(0.55, '#dce8f0');
  skyGrad.addColorStop(0.7, '#e8ede8');
  skyGrad.addColorStop(0.85, '#b7c9a0');
  skyGrad.addColorStop(1.0, '#8aa87a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Sun glow (warm spot)
  const grd = ctx.createRadialGradient(w * 0.32, h * 0.28, 0, w * 0.32, h * 0.28, w * 0.15);
  grd.addColorStop(0, 'rgba(255,240,210,0.6)');
  grd.addColorStop(0.5, 'rgba(255,220,180,0.2)');
  grd.addColorStop(1, 'rgba(255,220,180,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;

  const envMap = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();

  scene.environment = envMap;
  scene.environmentIntensity = 1.0;
  return envMap;
}

// ---------------------------------------------------------------------------
// 2. Day sky background (procedural gradient)
// ---------------------------------------------------------------------------
function createDayBackground() {
  const cnv = document.createElement('canvas');
  cnv.width = 2; cnv.height = 256;
  const ctx = cnv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#87b5da');
  g.addColorStop(0.4, '#b8d6ed');
  g.addColorStop(0.7, '#dce8f0');
  g.addColorStop(1.0, '#eef2f5');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createNightBackground() {
  const cnv = document.createElement('canvas');
  cnv.width = 2; cnv.height = 256;
  const ctx = cnv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#0a0e1a');
  g.addColorStop(0.3, '#10182a');
  g.addColorStop(0.6, '#1a2440');
  g.addColorStop(1.0, '#2a2a3a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------------------
// 3. Interior light placement — one PointLight per room
// ---------------------------------------------------------------------------
function buildInteriorLights() {
  const group = new THREE.Group();
  group.name = 'interiorLights';

  // Room-centre light positions based on room data
  const lightPositions = [];

  const addRoomLights = (rooms, baseY) => {
    for (const r of rooms) {
      if (r.type === 'void' || r.type === 'pool' || r.type === 'garden' || r.type === 'stair') continue;
      const cx = (r.x1 + r.x2) / 2;
      const cz = (r.z1 + r.z2) / 2;
      const cy = baseY + 8.5;  // near ceiling
      lightPositions.push({ x: cx, y: cy, z: cz });
    }
  };

  addRoomLights(GF_ROOMS, 0);
  addRoomLights(FF_ROOMS, CFG.FF_LEVEL);

  for (const p of lightPositions) {
    const pl = new THREE.PointLight(0xffeedd, 0, 18, 2);
    pl.position.set(p.x, p.y, p.z);
    group.add(pl);
  }

  return group;
}

// ---------------------------------------------------------------------------
// 4. Master lighting builder
// ---------------------------------------------------------------------------
export function addLighting(scene, renderer) {
  // --- Day sky background ---
  const dayBg = createDayBackground();
  const nightBg = createNightBackground();
  scene.background = dayBg;

  // --- HDRI environment for PBR reflections ---
  const envMap = addEnvironment(scene, renderer);

  // --- Ambient + Hemisphere ---
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  const hemi = new THREE.HemisphereLight(0xdcecff, 0xb7d9a0, 0.75);
  scene.add(ambient, hemi);

  // --- Sun (directional) ---
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.1);
  sun.position.set(70, 95, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 3;
  const sc = sun.shadow.camera;
  sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90; sc.near = 1; sc.far = 300;
  sun.target.position.copy(START_TARGET);
  scene.add(sun, sun.target);

  // --- Interior lights (initially off in day mode) ---
  const interiorLights = buildInteriorLights();
  interiorLights.visible = false;
  scene.add(interiorLights);

  // --- Fog (create once, just change colour) ---
  const fog = new THREE.Fog('#e6edf3', 160, 320);
  scene.fog = fog;

  // --- State ---
  let isNight = false;

  const ctrl = {
    setDayMode() {
      if (!isNight) return;
      isNight = false;

      scene.background = dayBg;
      fog.color.set('#e6edf3');

      ambient.intensity = 0.35;
      ambient.color.setHex(0xffffff);
      hemi.intensity = 0.75;
      sun.intensity = 2.1;
      scene.environmentIntensity = 1.0;

      interiorLights.visible = false;

      renderer.toneMappingExposure = 1.05;
    },

    setNightMode() {
      if (isNight) return;
      isNight = true;

      scene.background = nightBg;
      fog.color.set('#0a0e1a');

      ambient.intensity = 0.08;
      ambient.color.setHex(0x1a2440);
      hemi.intensity = 0.15;
      sun.intensity = 0.05;
      scene.environmentIntensity = 0.2;

      interiorLights.visible = true;

      renderer.toneMappingExposure = 0.6;
    },

    toggle() {
      if (isNight) this.setDayMode();
      else this.setNightMode();
      return isNight;
    },

    get isNight() { return isNight; },

    // Exposed for debugging
    lights: { ambient, hemi, sun, interiorLights },
    envMap,
  };

  return ctrl;
}
