// ============================================================================
// WINDOW SCHEDULE — explicit, hand-placed windows on EXTERIOR walls (no
// procedural generation). Widths follow the drawing's window schedule:
//   W 8'0"x8'0" · W1 6'0"x8'0" · W2 6'0"x6'0" · W3 5'0"x6'0"
//   W4 5'0"x3'0" · V 3'0"x2'0" (ventilator)
//
//   { o:'V'|'H', a, at, width, sill, head, type, note }
//   sill/head = bottom/top of the glazed opening (ft above the floor).
// Edit `at` to slide a window along its wall.
// ============================================================================

// -------- GROUND FLOOR --------
export const GF_WINDOWS = [
  { o:'H', a:2,    at:16, width:6, sill:2.5, head:7.5, type:'W1', note:'Master Bedroom (rear)' },
  { o:'H', a:2,    at:37, width:6, sill:2.5, head:7.5, type:'W1', note:'Bedroom 2 (rear)' },
  { o:'H', a:2,    at:47, width:3, sill:5,   head:7,   type:'V',  note:'B2 Toilet vent (rear)' },

  { o:'V', a:4,    at:5,  width:3, sill:3,   head:6,   type:'W4', note:'Master Wardrobe (west)' },
  { o:'V', a:4,    at:26, width:5, sill:2.5, head:7,   type:'W3', note:'Kitchen (west)' },

  { o:'H', a:36.5, at:6,  width:4, sill:2.5, head:7,   type:'W3', note:'Kitchen (front)' },
  { o:'H', a:36.5, at:17, width:6, sill:2.5, head:7.5, type:'W1', note:'Dining (front)' },
  { o:'H', a:36.5, at:28, width:8, sill:2.5, head:8,   type:'W',  note:'Living (front, tall)' },
];

// -------- FIRST FLOOR --------
export const FF_WINDOWS = [
  { o:'H', a:2,    at:16, width:6, sill:2.5, head:7.5, type:'W1', note:'Master Bedroom (rear)' },
  { o:'H', a:2,    at:37, width:6, sill:2.5, head:7.5, type:'W1', note:'Bedroom 2 (rear)' },
  { o:'H', a:2,    at:47, width:3, sill:5,   head:7,   type:'V',  note:'B2 Toilet vent (rear)' },
  { o:'H', a:2,    at:54, width:6, sill:2.5, head:7.5, type:'W1', note:'Cubical Sitting (rear)' },

  { o:'V', a:4,    at:5,  width:3, sill:3,   head:6,   type:'W4', note:'Master Wardrobe (west)' },
  { o:'V', a:4,    at:27, width:6, sill:2.5, head:7.5, type:'W1', note:'Bedroom 3 (west)' },
  { o:'V', a:62,   at:22, width:6, sill:2.5, head:7.5, type:'W1', note:'Family Lounge (east)' },

  { o:'H', a:36.5, at:9,  width:6, sill:2.5, head:7.5, type:'W1', note:'Bedroom 3 (front)' },
  { o:'H', a:36.5, at:20, width:5, sill:2.5, head:7,   type:'W3', note:'Gym (front)' },
];
