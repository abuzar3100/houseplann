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
import { createWalkMode } from './controls/walkMode.js';
// Phase 11 returns a lighting controller with setDayMode/setNightMode/toggle
import { addLighting } from './lighting/lighting.js';
import { buildFloorPlates } from './house/rooms/floorPlates.js';
import { deriveWallEdges } from './house/walls/deriveEdges.js';
import { buildWalls } from './house/walls/buildWalls.js';
import { buildDoors } from './house/doors/buildDoors.js';
import { createDoorController } from './house/doors/doorController.js';
import { GF_DOORS, FF_DOORS } from './house/doors/doorSchedule.js';
import { buildWindows } from './house/windows/buildWindows.js';
import { GF_WINDOWS, FF_WINDOWS } from './house/windows/windowSchedule.js';
import { buildStaircase } from './house/stairs/staircase.js';
import { buildRoof } from './house/roof/roof.js';
import { buildFurniture } from './house/furniture/furniture.js';
import { buildLandscape } from './house/landscape/landscape.js';
import { GF_ROOMS, FF_ROOMS } from './house/data/rooms.js';
import { mergeGroupStatic } from './utils/optimize.js';
import { initUI } from './ui/ui.js';
import { buildClickTargets, initInspector } from './house/inspector/inspector.js';

const renderer = createRenderer();
const scene = createScene();
const camera = createCamera();
const controls = createOrbit(camera, renderer.domElement);
const lighting = addLighting(scene, renderer);

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

// ---- walk mode (Phase 12): first-person with PointerLockControls + collision ----
const walkMode = createWalkMode(camera, renderer, stair.stepBoxes);

// ---- roof (Phase 7): flat RCC + parapet + tank + solar + drains ----
const roofGroup = buildRoof(FF_ROOMS);
scene.add(roofGroup);

// ---- furniture (Phase 9): low-poly per-room items ----
const gfFurniture = buildFurniture(GF_ROOMS, 0);
const ffFurniture = buildFurniture(FF_ROOMS, CFG.FF_LEVEL);
gf.group.add(gfFurniture);
ff.group.add(ffFurniture);

// ---- landscape (Phase 10): boundary wall, gates, driveway, pool deck, garden, trees ----
const landscapeGroup = buildLandscape();
scene.add(landscapeGroup);

gf.group.add(gfDoors.group, gfWins.group);
ff.group.add(ffDoors.group, ffWins.group);

scene.add(gf.group, ff.group);

// ---- room inspector (Phase 14B): invisible click targets for room info ----
const clickTargets = buildClickTargets();
scene.add(clickTargets);

// ---- optimisation (Phase 13): merge static geometry to reduce draw calls ----
// Merge each non-toggleable sub-group individually to preserve independent toggles.
const gfWalls = gf.group.getObjectByName('walls');
const ffWalls = ff.group.getObjectByName('walls');
if (gfWalls) mergeGroupStatic(renderer, gfWalls, 'GF Walls');
if (ffWalls) mergeGroupStatic(renderer, ffWalls, 'FF Walls');
mergeGroupStatic(renderer, stair.group, 'Staircase');
// NOTE: doors are NOT merged — leaves must stay separate to swing open (F key).
mergeGroupStatic(renderer, gfWins.group, 'GF Windows');
mergeGroupStatic(renderer, ffWins.group, 'FF Windows');
mergeGroupStatic(renderer, roofGroup, 'Roof');
mergeGroupStatic(renderer, landscapeGroup, 'Landscape');

// ---- view/floor state ----
const state = { floors: 'both', view: '3d', labels: true, roof: true, furniture: true, landscape: true, night: false, walk: false, inspector: true };

// ---- room inspector init ----
const inspector = initInspector(renderer, scene, camera, clickTargets);

// ---- doors: press F to open/close nearest door ----
const doorCtrl = createDoorController(camera, [gfDoors.leaves, ffDoors.leaves]);
const clock = new THREE.Clock();

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
  landscapeGroup.visible = state.landscape;
}

function setFloors(mode) { state.floors = mode; applyState(); }
function toggleLabels(on) { state.labels = on; applyState(); }
function toggleRoof(on) { state.roof = on; applyState(); }
function toggleFurniture(on) { state.furniture = on; applyState(); }
function toggleLandscape(on) { state.landscape = on; applyState(); }
function toggleNight() {
  state.night = lighting.toggle();
  document.querySelector('[data-toggle="night"]')?.classList.toggle('active', state.night);
}

function toggleWalk() {
  const wasActive = walkMode.toggle();
  state.walk = wasActive;
  // Disable orbit controls while walking
  controls.enabled = !wasActive;
  document.querySelector('[data-action="walk"]')?.classList.toggle('active', wasActive);
}

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

initUI({ setFloors, setView, toggleLabels, toggleRoof, toggleFurniture, toggleLandscape, toggleNight, toggleWalk, reset });
applyState();

// ---- render loop ----
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  doorCtrl.update(dt);
  if (walkMode.isActive) walkMode.update();
  else controls.update();
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Debug/inspection hook (harmless; lets tooling drive the view + capture frames)
window.__app = { renderer, scene, camera, controls, state, setFloors, setView, toggleLabels, toggleRoof, toggleFurniture, toggleLandscape, toggleNight, toggleWalk, walkMode, lighting, inspector, reset,
  stairSteps: stair.stepBoxes };
