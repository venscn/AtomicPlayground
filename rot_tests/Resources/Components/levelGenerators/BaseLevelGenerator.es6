'use strict';
// 'noatomic component'; -- don't want to expose to the editor since this is more like an abstract base class
import * as triggerEvent from 'atomicTriggerEvent';
import MapData from 'MapData';
import CustomJSComponent from 'CustomJSComponent';
export default class BaseLevelGenerator extends CustomJSComponent {
    inspectorFields = {
        width: 80,
        height: 25
    };
    mapData = null;

    start() {
        this.generateLevel();
    }

    generateLevel() {
        this.buildMapData();
        triggerEvent.trigger(this.node, 'onLevelGenerated', this.mapData);
        return this.mapData;
    }

    /** overridable */
    buildMapData() {
        throw new Error('BaseLevelGenerator.buildMapData must be overridden.');
    }

    /**
     * event to listen for someone asking for map data
     * @returns {MapData} the map data that was generated
     */
    onGetMapData() {
        return this.mapData;
    }

    getNeighborSignature(x, y, ignoreTypes = []) {
        const tiles = this.mapData.tiles;
        let t = 0;
        // Determine what kind of tile we are and add it to the list of tiles that we shouldn't calculate edges against
        let ignore = ignoreTypes.concat(tiles[x][y].terrainType);

        // left edge
        if (x === 0 || ignore.indexOf(tiles[x - 1][y].terrainType) === -1) {
            t += 1;
        }

        // right edge
        if (x === this.width - 1 || ignore.indexOf(tiles[x + 1][y].terrainType) === -1) {
            t += 2;
        }

        // top edge
        if (y === 0 || ignore.indexOf(tiles[x][y - 1].terrainType) === -1) {
            t += 4;
        }

        // bottom edge
        if (y === this.height - 1 || ignore.indexOf(tiles[x][y + 1].terrainType) === -1) {
            t += 8;
        }

        /* not sure this is working correctly
        // top left edge
        if (!this.mapData.inBounds(x - 1, y - 1) || ignore.indexOf(tiles[x - 1][y - 1].terrainType) === -1) {
            t += 16;
        }

        // bottom right
        if (!this.mapData.inBounds(x + 1, y + 1) || ignore.indexOf(tiles[x + 1][y + 1].terrainType) === -1) {
            t += 32;
        }

        // bottom left
        if (!this.mapData.inBounds(x - 1, y + 1) || ignore.indexOf(tiles[x - 1][y + 1].terrainType) === -1) {
            t += 64;
        }

        // top right
        if (!this.mapData.inBounds(x + 1, y - 1) || ignore.indexOf(tiles[x + 1][y - 1].terrainType) === -1) {
            t += 128;
        }
        */
        return t;
    }

    /**
     * Run through the map and process edge tiles, making sure that they are set as the proper ege
     */
    processEdges() {
        // run through the entire map and remap the edge tiles
        this.mapData.iterateMap((x, y, tile) => {
            if (tile.terrainType === MapData.TILE_FLOOR) {
                tile.edge = this.getNeighborSignature(x, y);
            }
        });

        this.mapData.iterateMap((x, y, tile) => {
            if (tile.terrainType === MapData.TILE_NONE && this.getNeighborSignature(x, y, [MapData.TILE_WALL]) > 0) {
                tile.terrainType = MapData.TILE_WALL;
                tile.blueprint = 'tile_shadow_wall';
            }
        });

    }

    placeDoors(rooms) {
        // TOOD: move this out into it's own generator ( a door generator or something )
        for (let rIndex = 0; rIndex < rooms.length; rIndex++) {
            rooms[rIndex].getDoors((x, y) => {
                let tile = this.mapData.getTile(x, y);
                let doorbp = null;
                switch (tile.edge) {
                    case 12:
                        doorbp = 'door_ew';
                        break;

                    case 3:
                        doorbp = 'door_ns';
                        break;
                }
                if (this.mapData.isEmpty(x,y)) {
                    if (doorbp) {
                        let entity = MapData.buildEntity(doorbp);
                        this.mapData.addEntityAtPosition(x, y, entity); 
                    }
                }
            });
        }
    }

    placeCreatures(roomData) {
        triggerEvent.trigger(this.node, 'onPlaceCreatures', this.mapData, roomData);
    }

    placeItems(roomData) {
        triggerEvent.trigger(this.node, 'onPlaceItems', this.mapData, roomData);

    }
}
