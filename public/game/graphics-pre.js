// Runs right after three.min.js, before any material or color is created,
// so every hex color in the game is interpreted as sRGB and lit in linear space.
if (window.THREE && THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
