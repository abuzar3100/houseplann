// Wires the #ui overlay buttons to the app controller.
// controller: { setFloors(mode), setView(mode), toggleLabels(on), toggleRoof(on), toggleFurniture(on), toggleLandscape(on), toggleNight(), reset() }
export function initUI(controller) {
  const ui = document.getElementById('ui');

  const activate = (attr, val) => {
    ui.querySelectorAll(`[data-${attr}]`).forEach((b) =>
      b.classList.toggle('active', b.dataset[attr] === val));
  };

  ui.querySelectorAll('[data-floors]').forEach((btn) =>
    btn.addEventListener('click', () => {
      controller.setFloors(btn.dataset.floors);
      activate('floors', btn.dataset.floors);
    }));

  ui.querySelectorAll('[data-view]').forEach((btn) =>
    btn.addEventListener('click', () => {
      controller.setView(btn.dataset.view);
      activate('view', btn.dataset.view);
    }));

  const labelsBtn = ui.querySelector('[data-toggle="labels"]');
  let labelsOn = true;
  labelsBtn.addEventListener('click', () => {
    labelsOn = !labelsOn;
    controller.toggleLabels(labelsOn);
    labelsBtn.classList.toggle('active', labelsOn);
  });

  const roofBtn = ui.querySelector('[data-toggle="roof"]');
  let roofOn = true;
  roofBtn.addEventListener('click', () => {
    roofOn = !roofOn;
    controller.toggleRoof(roofOn);
    roofBtn.classList.toggle('active', roofOn);
  });

  const furnitureBtn = ui.querySelector('[data-toggle="furniture"]');
  let furnitureOn = true;
  furnitureBtn.addEventListener('click', () => {
    furnitureOn = !furnitureOn;
    controller.toggleFurniture(furnitureOn);
    furnitureBtn.classList.toggle('active', furnitureOn);
  });

  const landscapeBtn = ui.querySelector('[data-toggle="landscape"]');
  let landscapeOn = true;
  landscapeBtn.addEventListener('click', () => {
    landscapeOn = !landscapeOn;
    controller.toggleLandscape(landscapeOn);
    landscapeBtn.classList.toggle('active', landscapeOn);
  });

  const nightBtn = ui.querySelector('[data-toggle="night"]');
  nightBtn.addEventListener('click', () => {
    controller.toggleNight();
  });

  const walkBtn = ui.querySelector('[data-action="walk"]');
  walkBtn.addEventListener('click', () => {
    controller.toggleWalk();
  });

  ui.querySelector('[data-action="reset"]').addEventListener('click', () => controller.reset());
}
