"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.update = update;

require("atomic-blueprintlib.bundle");

var _atomicBlueprintlib = require("atomic-blueprintlib");

var blueprintLib = _interopRequireWildcard(_atomicBlueprintlib);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// This script is the main entry point of the game

// called at the start of play

// create a 2D scene
var scene = new Atomic.Scene(); // need to initialize the library bundle so we can access the contents

scene.createComponent("Octree");

var cameraNode = scene.createChild("Camera");
cameraNode.position = [0.0, 0.0, -10.0];

var camera = cameraNode.createComponent("Camera");
camera.orthographic = true;
camera.orthoSize = Atomic.graphics.height * Atomic.PIXEL_SIZE;

var viewport = null;

viewport = new Atomic.Viewport(scene, camera);
Atomic.renderer.setViewport(0, viewport);

// Put some limits on the renderer
Atomic.engine.setMaxFps(30);
// not existant
// Atomic.engine.vSync = true;
blueprintLib.catalog.loadBlueprints(require("blueprints"));

// Use the blueprint system to spawn the blueprints named star1 and star2.  All components that
// these need are defined in the blueprint and the blueprint system handles attaching the components.
// Each component, in turn is in charge of initializing itself based upon it's section of the blueprint
var spaceNode = blueprintLib.createChild(scene, "star1");
var spaceNode2 = blueprintLib.createChild(scene, "star2");

// Specify a start position instead of relying on the blueprint
var spaceNode3 = blueprintLib.createChildAtPosition(scene, "star2", [2, 2]);

// override the speed -- we know what we are doing so cast to any
var starOverride = blueprintLib.getBlueprint("star2");
starOverride.Star.speed = 1000;

var spaceNode4 = blueprintLib.createChildAtPosition(scene, starOverride, [1, 1]);

// called per frame
function update(timeStep) {
    // console.log('update');
}