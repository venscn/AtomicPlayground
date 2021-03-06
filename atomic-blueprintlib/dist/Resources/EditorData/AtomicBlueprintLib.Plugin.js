"use strict";
// plugin for generating prefabs from blueprints
require("../Modules/atomic-blueprintlib.bundle");
var blueprintLib = require("atomic-blueprintlib");
var ExamplePluginUILabel = "Atomic BlueprintLib";
var debug = false;
var AtomicBlueprintlibPlugin = (function () {
    function AtomicBlueprintlibPlugin() {
        this.name = "AtomicBlueprintLibPlugin";
        this.description = "Support plugin for the Atomic Blueprint Library";
        this.serviceLocator = null;
        this.blueprintPath = "../Modules/blueprints";
    }
    AtomicBlueprintlibPlugin.prototype.log = function (message) {
        if (debug) {
            console.log(this.name + ": " + message);
        }
    };
    AtomicBlueprintlibPlugin.prototype.loadBlueprintCatalog = function () {
        var blueprints;
        try {
            var blueprintFile = require(this.blueprintPath);
            // look for an export called default and if it
            // exists then that contains all the blueprints
            if (blueprintFile["default"]) {
                blueprints = blueprintFile["default"];
            }
            else if (blueprintFile["blueprints"]) {
                blueprints = blueprintFile["blueprints"];
            }
            else {
                blueprints = blueprintFile;
            }
        }
        catch (e) {
            throw new Error("Could not load blueprints.  Ensure that 'Resources/Modules/blueprints.js' exists");
        }
        blueprintLib.catalog.loadBlueprints(blueprints);
    };
    AtomicBlueprintlibPlugin.prototype.initialize = function (serviceLoader) {
        this.log("initialize");
        this.serviceLocator = serviceLoader;
        if (this.serviceLocator) {
            this.serviceLocator.projectServices.register(this);
            this.serviceLocator.uiServices.register(this);
        }
    };
    AtomicBlueprintlibPlugin.prototype.projectUnloaded = function () {
        this.log("projectUnloaded");
        blueprintLib.reset();
        this.serviceLocator.uiServices.removePluginMenuItemSource(ExamplePluginUILabel);
        if (this.serviceLocator) {
            this.serviceLocator.projectServices.unregister(this);
            this.serviceLocator.uiServices.unregister(this);
        }
    };
    AtomicBlueprintlibPlugin.prototype.projectLoaded = function (ev) {
        this.log("projectLoaded");
        this.serviceLocator.uiServices.createPluginMenuItemSource(ExamplePluginUILabel, { "Generate Prefabs from Blueprints": [(this.name + ".generate")] });
    };
    AtomicBlueprintlibPlugin.prototype.playerStarted = function () {
        this.log("playerStarted");
        try {
            this.loadBlueprintCatalog();
            blueprintLib.generatePrefabs();
        }
        finally {
            blueprintLib.reset();
        }
    };
    AtomicBlueprintlibPlugin.prototype.menuItemClicked = function (refId) {
        this.log("menuItemClicked: " + refId);
        if (refId === this.name + ".generate") {
            try {
                this.loadBlueprintCatalog();
                blueprintLib.generatePrefabs();
            }
            finally {
                blueprintLib.reset();
            }
            return true;
        }
        return false;
    };
    return AtomicBlueprintlibPlugin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new AtomicBlueprintlibPlugin();
