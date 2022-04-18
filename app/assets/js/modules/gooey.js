
import Tile from '../components/gooey/tile';
import SceneCard from './../components/gooey/scene';


export default class Gooey {
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
                effectShape : img.getAttribute("shape"),
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
            this.tilesRendered = new Tile({
                scene : this.sceneTiles[i],
                tile : this.tiles[i],
                effectShape : null
            })
        }
    }
    requestAnimationSceneTiles(){
        for(let i = 0 ; i < this.sceneTiles.length; i++){
            const scene = this.sceneTiles[i];
            scene.setUpdateCallback(() => {})
            scene.update();
        }
    }
}