// ============================================================================
// Sri Afsar Residence — 3D architectural model
// Entry point. Assembles renderer / scene / camera / controls / lighting and
// the floor geometry, then runs the render loop.
// Phase 2 = corrected geometry (floor plates + labels). Walls come in Phase 3.
// ============================================================================
import * as THREE from 'three';
import { CFG } from './config.js';
import { createRenderer } from './renderer/renderer.js';
import { createScene } from './scene/scene.js';
import { createCamera, START_POS, START_TARGET } from './camera/camera.js';
import { createOrbit } from './controls/orbitControls.js';
import { addLighting } from './lighting/lighting.js';
import { buildFloorPlates } from './house/rooms/floorPlates.js';
import { deriveWallEdges } from './house/walls/deriveEdges.js';
import { buildWalls } from './house/walls/buildWalls.js';
import { buildDoors } from './house/doors/buildDoors.js';
import { GF_DOORS, FF_DOORS } from './house/doors/doorSchedule.js';
import { buildWindows } from './house/windows/buildWindows.js';
import { GF_WINDOWS, FF_WINDOWS } from './house/windows/windowSchedule.js';
import { buildStaircase } from './house/stairs/staircase.js';
import { buildRoof } from './house/roof/roof.js';
import { buildFurniture } from './house/furniture/furniture.js';
import { GF_ROOMS, FF_ROOMS } from './house/data/rooms.js';
import { initUI } from './ui/ui.js';

const renderer = createRenderer();
const scene = createScene();
const camera = createCamera();
const controls = createOrbit(camera, renderer.domElement);
addLighting(scene);

// ---- geometry ----
const gf = buildFloorPlates(GF_ROOMS, 0);
const ff = buildFloorPlates(FF_ROOMS, CFG.FF_LEVEL);

// ---- doors (Phase 4) + windows (Phase 5): explicit, hand-placed openings ----
const gfDoors = buildDoors(GF_DOORS, 0);
const ffDoors = buildDoors(FF_DOORS, CFG.FF_LEVEL);
const gfWins = buildWindows(GF_WINDOWS, 0);
const ffWins = buildWindows(FF_WINDOWS, CFG.FF_LEVEL);

// ---- walls (Phase 3): exterior 9" / interior 4½", cut around every opening ----
gf.group.add(buildWalls(deriveWallEdges(GF_ROOMS), 0, [...gfDoors.openings, ...gfWins.openings]));
ff.group.add(buildWalls(deriveWallEdges(FF_ROOMS), CFG.FF_LEVEL, [...ffDoors.openings, ...ffWins.openings]));
// ---- staircase (Phase 6): real U-return steps in the X25-34 well, GF→FF ----
const stair = buildStaircase({ x1: 25, x2: 34, z1: 2, z2: 19, baseY: 0, rise: CFG.FF_LEVEL });
gf.group.add(stair.group);

// ---- roof (Phase 7): flat RCC + parapet + tank + solar + drains ----
const roofGroup = buildRoof(FF_ROOMS);
scene.add(roofGroup);

// ---- furniture (Phase 9): low-poly per-room items ----
const gfFurniture = buildFurniture(GF_ROOMS, 0);
const ffFurniture = buildFurniture(FF_ROOMS, CFG.FF_LEVEL);
gf.group.add(gfFurniture);
ff.group.add(ffFurniture);

gf.group.add(gfDoors.group, gfWins.group);
ff.group.add(ffDoors.group, ffWins.group);

scene.add(gf.group, ff.group);

// ---- view/floor state ----
const state = { floors: 'both', view: '3d', labels: true, roof: true, furniture: true };

function applyState() {
  const showGF = state.floors === 'gf' || state.floors === 'both';
  const showFF = state.floors === 'ff' || state.floors === 'both';
  gf.group.visible = showGF;
  ff.group.visible = showFF;
  roofGroup.visible = state.roof && showFF;   // roof only makes sense with the first floor
  gf.labels.forEach((l) => (l.visible = state.labels && showGF));
  ff.labels.forEach((l) => (l.visible = state.labels && showFF));
  gfFurniture.visible = state.furniture && showGF;
  ffFurniture.visible = state.furniture && showFF;
}

function setFloors(mode) { state.floors = mode; applyState(); }
function toggleLabels(on) { state.labels = on; applyState(); }
function toggleRoof(on) { state.roof = on; applyState(); }
function toggleFurniture(on) { state.furniture = on; applyState(); }

function setView(mode) {
  state.view = mode;
  if (mode === 'plan') {
    camera.up.set(0, 0, -1);                 // +Z (front) at bottom, like the drawing
    camera.fov = 16; camera.updateProjectionMatrix();
    camera.position.set(CFG.PLOT_W / 2, 300, CFG.PLOT_D / 2 + 0.001);
    controls.target.set(CFG.PLOT_W / 2, 0, CFG.PLOT_D / 2);
  } else {
    reset();
  }
  controls.update();
}

function reset() {
  camera.up.set(0, 1, 0);
  camera.fov = 45; camera.updateProjectionMatrix();
  camera.position.copy(START_POS);
  controls.target.copy(START_TARGET);
  controls.update();
}

initUI({ setFloors, setView, toggleLabels, toggleRoof, toggleFurniture, reset });
applyState();

// ---- render loop ----
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Debug/inspection hook (harmless; lets tooling drive the view + capture frames)
window.__app = { renderer, scene, camera, controls, state, setFloors, setView, toggleLabels, toggleRoof, toggleFurniture, reset,
  stairSteps: stair.stepBoxes };
