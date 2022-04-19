
import * as THREE from 'THREE';
import { convertStringToUniform } from '../ultilities/ulti';
import Tile from '../components/gooey/tile';
import SceneCard from '../components/gooey/scene';
import gooeyShader from '../../shaders/gooey/gooeyShader.glsl';
import shapeShader from '../../shaders/gooey/shapeShader.glsl';
import trippyShader from '../../shaders/gooey/trippyShader.glsl';
import waveShader from '../../shaders/gooey/waveShader.glsl';
import revealShader from '../../shaders/gooey/revealShader.glsl';


const effects = {
    gooey : gooeyShader,
    shape : shapeShader,
    trippy : trippyShader,
    wave : waveShader,
    reveal : revealShader
}

export default class GooeyEffects {
    constructor(){
        this.tilesSelector = '.gooey-tile';
        this.tiles = [];
        this.tilesRendered = [];
        this.sceneTiles = [];
        
        this.init();
    }
    init(){
        this.grabAllTile();
        this.createSceneEachTile();
        this.renderTiles();
        this.requestAnimationSceneTiles();
    }
    grabAllTile(){
        const tiles = document.querySelectorAll(this.tilesSelector);
        for(let i = 0; i < tiles.length; i++){
            const tile = tiles[i];
            const img = tile.querySelector(".js-tile");
            const obj = {
                id : `tile${i}`,
                idCanvas : `stage${i}`,
                imgSrc : img.src,
                hoverSrc : img.dataset.hover,
                effect : img.getAttribute("data-effect"),
                dataUniform : convertStringToUniform(img.getAttribute("data-uniform")),
                width : img.width,
                height : img.height,
                imgDom : img
            }
            this.tiles.push(obj);
        }
    }
    createSceneEachTile(){
        for(let i = 0; i < this.tiles.length; i++){
            const { idCanvas, width, height } = this.tiles[i];
            const canvas = document.getElementById(idCanvas);
            const scene = new SceneCard({
                $container : canvas,
                size : {
                    width : width,
                    height : height
                },
                cameraOption : {
                    far : 10000,
                    near : 1
                }
            });
            this.sceneTiles.push(scene);
        }
    }
    renderTiles(){
        for(let i = 0 ; i < this.tiles.length; i++){
            const effect = effects[this.tiles[i].effect];
            if(!effect) continue;
            const tileRendered = new Tile({
                scene : this.sceneTiles[i],
                tile : this.tiles[i],
                effectShape : effect,
                duration : 0.5,
            });
            this.tilesRendered.push(tileRendered);
        }
    }
    requestAnimationSceneTiles(){
        for(let i = 0 ; i < this.tilesRendered.length; i++){
            const scene = this.sceneTiles[i];
            scene.setUpdateCallback(() => {
                this.tilesRendered[i].update();
            })
            scene.update();
        }
    }
}