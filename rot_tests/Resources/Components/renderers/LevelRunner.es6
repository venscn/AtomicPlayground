'use strict';
'atomic component';
import CustomJSComponent from 'CustomJSComponent';
import * as triggerEvent from 'atomicTriggerEvent';
//import { nodeBuilder } from 'atomic-blueprintLib';
import MapData from 'MapData';
import ROT from 'rot-js';

/**
 * Level runner component. This component is in charge of running a particular
 * level and making sure actors act, etc.  It is also the interface that entities
 * can use to get to the map data.
 *
 * This component, on startup, will register itself as scene.Level
 */
export default class LevelRunner extends CustomJSComponent {

    inspectorFields = {
        debug: false,
        mapData: null,
        turnBased: true,
        useFov: true,
        fovRadius: 50
    };

    /** The hero node */
    hero = null;

    /** ROT scheduler */
    scheduler = null;

    /** ROT engine */
    engine = null;

    /** # of turns elapsed */
    turns = 0;

    /** The map data for this level */
    mapData = null;

    /** use field of view calcs */
    useFov = true;

    /** radius to run field of view calcs on.  You may want to tweak this if you have more or less tiles on the screen at once. */
    fovRadius = 50;

    start() {
        this.scene.Level = this;
        this.scheduler = new ROT.Scheduler.Simple();
        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
    }

    getTileAt(pos) {
        // yes...this looks strange, but we are getting a Float32Array in here, not an array, so destructuring doesn't work
        let [x, y] = [pos[0], pos[1]];
        return this.mapData.getTile(x, y);
    }

    getEntitiesAt(pos) {
        // yes...this looks strange, but we are getting a Float32Array in here, not an array, so destructuring doesn't work
        let [x, y] = [pos[0], pos[1]];
        return this.mapData.getEntitiesAt(x, y);
    }

    iterateEntitiesAt(pos, callback) {
        // yes...this looks strange, but we are getting a Float32Array in here, not an array, so destructuring doesn't work
        let [x, y] = [pos[0], pos[1]];
        this.mapData.iterateEntitiesAt(x, y, callback);
    }

    onSetMapData(mapData) {
        // let's just defer to the renderer for now
        //
        this.DEBUG(`LevelRunner: onSetMapData called Dimensions - ${mapData.width} x ${mapData.height}`);
        this.mapData = mapData;

        this.createHero(mapData.getRandomEmptyPosition());

        triggerEvent.trigger(this.node, 'onRender', mapData);
    }

    createHero(pos) {
        // yes...this looks strange, but we are getting a Float32Array in here, not an array, so destructuring doesn't work
        let [x, y] = [pos[0], pos[1]];
        this.DEBUG(`Create actor at: ${x},${y}`);
        this.hero = new MapData.buildEntity('hero');
        this.mapData.addEntityAtPosition(x, y, this.hero);
    }

    registerActor(ai) {
        this.scheduler.add(ai, true);
    }

    deregisterActor(ai) {
        this.scheduler.remove(ai);
    }

    pause(val) {
        if (typeof(val) === 'undefined' || val) {
            this.engine.lock();
        } else {
            this.engine.unlock();
        }
    }

    update( /* timestep */ ) {
        // ROT will handle scheduling movements
        //this.actors.forEach((actor) => {
        //actor.act();
        //});
    }

    updateFov(position) {
        if (this.useFov) {
            triggerEvent.trigger(this.node, 'onUpdateFov', position, this.fovRadius, this.mapData);
        }
    }

    incTurn() {
        this.turns++;
    }

    gameOver() {
        this.engine.lock();
        console.log('Game Over!');
    }

}
