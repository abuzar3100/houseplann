import * as THREE from 'three';

// Floating text label as a canvas sprite (used for room names).
export function makeLabel(text, x, y, z) {
  const cnv = document.createElement('canvas');
  cnv.width = 256; cnv.height = 64;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  roundRect(ctx, 4, 14, 248, 36, 10); ctx.fill();
  ctx.fillStyle = '#263238';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 33, 240);

  const tex = new THREE.CanvasTexture(cnv);
  tex.anisotropy = 4;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  spr.scale.set(8, 2, 1);
  spr.position.set(x, y, z);
  spr.userData.isLabel = true;
  return spr;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
