
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
    init() {
        if (window.innerWidth < 768) {
            return;
        }
        this.grabAllTile((obj) => {
            this.tiles.push(obj);
            const scene = this.createSceneEachTile(obj);
            this.sceneTiles.push(scene);
            const tileRendered = this.renderTile(obj, scene);
            this.tilesRendered.push(tileRendered);
            this.requestAnimationSceneTile(tileRendered, scene);
        });
    }
    grabAllTile(callback = null) {
        const tiles = document.querySelectorAll(this.tilesSelector);
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const img = tile.querySelector(".js-tile");
            const newImg = new Image();
            newImg.src = img.src;
            newImg.onload = () => {
                const obj = {
                    id: `tile${i}`,
                    idCanvas: `stage${i}`,
                    imgSrc: img.src,
                    hoverSrc: img.dataset.hover,
                    effect: img.getAttribute("data-effect"),
                    dataUniform: convertStringToUniform(img.getAttribute("data-uniform")),
                    width: img.width,
                    height: img.height,
                    imgDom: img
                }
                callback && callback(obj);
            };
        }
    }
    createSceneEachTile(tile) {
        const { idCanvas, width, height } = tile;
        const canvas = document.getElementById(idCanvas);
        const scene = new SceneCard({
            $container: canvas,
            size: {
                width: width,
                height: height
            },
            cameraOption: {
                far: 10000,
                near: 1
            }
        });
        return scene;
    }
    renderTile(tile, scene) {
        const effect = effects[tile.effect];
        if (!effect) return;
        const tileRendered = new Tile({
            scene: scene,
            tile: tile,
            effectShape: effect,
            duration: 1.0,
        });
        return tileRendered;
    }
    requestAnimationSceneTile(tileRendered, scene) {
        scene.setUpdateCallback(() => {
            tileRendered.update();
        })
        scene.update();
    }
}