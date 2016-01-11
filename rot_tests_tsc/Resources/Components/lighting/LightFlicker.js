// a flickering light component
'use strict';
'atomic component';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LightFlicker = (function (_super) {
    __extends(LightFlicker, _super);
    function LightFlicker() {
        _super.apply(this, arguments);
        this.inspectorFields = {
            baseRange: 45,
            // make sure first update catches.  Can also be used to offset different lights
            time: 100,
            flicker: 'mmmaaaammmaaaabcdefgabcdefg',
            speed: 0.05
        };
        this.light = null;
        this.lightType = 0;
        this.baseRange = 45;
        this.time = 100;
        this.speed = 0.05;
    }
    LightFlicker.prototype.start = function () {
        this.light = this.node.getComponent('Light');
        this.lightType = LightFlicker.LIGHT;
        if (!this.light) {
            this.light = this.node.getComponent('PointLight2D');
            this.lightType = LightFlicker.POINT_LIGHT_2D;
        }
        this.targetValue = this.baseRange;
        this.index = Math.random() * (this.flicker.length - 1);
    };
    LightFlicker.prototype.incDecLightRange = function (range) {
        switch (this.lightType) {
            case LightFlicker.POINT_LIGHT_2D:
                this.light.radius += range;
                break;
            case LightFlicker.LIGHT:
                this.light.range += range;
                break;
        }
    };
    LightFlicker.prototype.getLightRange = function () {
        switch (this.lightType) {
            case LightFlicker.POINT_LIGHT_2D:
                return this.light.radius;
            case LightFlicker.LIGHT:
                return this.light.range;
        }
        return -1;
    };
    LightFlicker.prototype.update = function (timestep) {
        var time = (this.time += timestep);
        if (time > this.speed) {
            var index = this.index++;
            time = this.time = 0.0;
            if (index >= this.flicker.length) {
                index = this.index = 0;
            }
            var targetValue = this.targetValue = this.baseRange * (this.flicker.charCodeAt(index) / 255);
            if (this.getLightRange() < targetValue) {
                this.incDecLightRange(timestep * 10);
            }
            else if (this.getLightRange() > targetValue) {
                this.incDecLightRange(timestep * -10);
            }
        }
    };
    LightFlicker.POINT_LIGHT_2D = 1;
    LightFlicker.LIGHT = 2;
    return LightFlicker;
})(Atomic.JSComponent);
module.exports = LightFlicker;
