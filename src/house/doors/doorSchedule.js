// ============================================================================
// DOOR SCHEDULE — explicit, hand-placed doors (NO auto-centering).
// Each door is positioned on a specific wall line, at an exact position.
//   { o:'V'|'H', a, at, width, type, note }
//   - o/a  : the wall line (V = vertical wall at X=a; H = horizontal wall at Z=a)
//   - at   : start position along the wall (ft)
//   - width: door leaf width (ft) — from the drawing's door schedule:
//            MD 6'0" (main), PD/GD 5'0", D 4'0", D1 3'0", GD1 3'6"
//   - type : 'main' | 'room' | 'toilet' | 'ward'  (drives height + leaf look)
//
// NOTE: positions are set to the rooms' doorways as read from the plans and are
// the single place to fine-tune. Edit `at` to slide a door along its wall.
// ============================================================================

const DOOR_H = { main: 8, room: 7, toilet: 7, ward: 7 };
export const doorHeight = (t) => DOOR_H[t] ?? 7;

// -------- GROUND FLOOR --------
export const GF_DOORS = [
  { o:'H', a:36.5, at:45,  width:5,   type:'main',   note:'Main entrance — Foyer front' },

  { o:'H', a:19,   at:18,  width:3,   type:'room',   note:'Master Bedroom entry' },
  { o:'V', a:13,   at:4,   width:2.5, type:'ward',   note:'Master Wardrobe' },
  { o:'V', a:13,   at:15,  width:2.5, type:'toilet', note:'Master Att. Toilet' },

  { o:'H', a:19,   at:39,  width:3,   type:'room',   note:'Bedroom 2 entry' },
  { o:'V', a:46,   at:3,   width:2.5, type:'toilet', note:'B2 Att. Toilet' },
  { o:'V', a:46,   at:13,  width:2.5, type:'ward',   note:'B2 Wardrobe' },

  { o:'V', a:16,   at:30,  width:3,   type:'room',   note:'Kitchen ↔ Dining' },
  { o:'V', a:42,   at:30,  width:3.5, type:'room',   note:'Living ↔ Foyer' },
];

// -------- FIRST FLOOR --------
export const FF_DOORS = [
  { o:'H', a:19,   at:18,  width:3,   type:'room',   note:'Master Bedroom entry' },
  { o:'V', a:13,   at:4,   width:2.5, type:'ward',   note:'Master Wardrobe' },
  { o:'V', a:13,   at:15,  width:2.5, type:'toilet', note:'Master Att. Toilet' },

  { o:'H', a:19,   at:39,  width:3,   type:'room',   note:'Bedroom 2 entry' },
  { o:'V', a:46,   at:3,   width:2.5, type:'toilet', note:'B2 Att. Toilet' },
  { o:'V', a:46,   at:13,  width:2.5, type:'ward',   note:'B2 Wardrobe' },

  { o:'H', a:24,   at:8,   width:3,   type:'room',   note:'Bedroom 3 entry (from toilet lobby)' },
  { o:'V', a:12,   at:20,  width:2.5, type:'toilet', note:'B3 Att. Toilet' },
  { o:'V', a:19,   at:20,  width:2.5, type:'ward',   note:'B3 Wardrobe' },

  { o:'H', a:31,   at:20,  width:3,   type:'room',   note:'Gym entry (from corridor)' },
  { o:'V', a:52,   at:8,   width:3,   type:'room',   note:'Cubical Sitting entry' },
  { o:'V', a:52,   at:24,  width:3,   type:'room',   note:'Family Lounge entry' },
];
