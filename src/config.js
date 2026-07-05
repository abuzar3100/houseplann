// ============================================================================
// Global architectural constants. 1 unit = 1 foot. Y = up.
// Coordinate system matches the approved drawings:
//   X = width  (0..64), left→right
//   Z = depth  (0..40), back(0)→front/road(40)
// ============================================================================
export const CFG = {
  PLOT_W: 64,          // plot width  (X)
  PLOT_D: 40,          // plot depth  (Z)

  WALL_H: 10,          // floor-to-floor wall height (ft)
  DH_H: 20,            // double-height volume (living)
  WALL_T_EXT: 0.75,    // exterior wall thickness (9")
  WALL_T_INT: 0.375,   // interior wall thickness (4.5")

  SLAB_T: 0.5,         // structural slab thickness
  FF_LEVEL: 11,        // first-floor finished level (Y) = 10ft walls + 1ft slab
  ROOF_Y: 21,          // top of first-floor walls / roof slab level

  SETBACK_TOP: 2,      // rooms start at Z=2
  SETBACK_BOT: 3.5,    // bottom setback
};

// Architectural palette reference (kept from drawings for documentation;
// Phase 8 PBR materials in src/materials/materials.js now drive rendering).
export const COLORS = {
  bedroom:  '#A5D6A7',
  wardrobe: '#C8E6C9',
  toilet:   '#B3E5FC',
  kitchen:  '#FFE082',
  dining:   '#FFF59D',
  living:   '#FFCCBC',
  foyer:    '#D7CCC8',
  stair:    '#BCAAA4',
  garden:   '#81C784',
  pool:     '#4FC3F7',
  parking:  '#B0BEC5',
  corridor: '#CFD8DC',
  open:     '#E0E0E0',
  utility:  '#ECEFF1',
  lounge:   '#FFE082',
  sitting:  '#FFF59D',
  gym:      '#F48FB1',
  balcony:  '#B39DDB',
  void:     '#FFCCBC',
};
