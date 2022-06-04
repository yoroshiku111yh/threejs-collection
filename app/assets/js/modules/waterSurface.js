
import { Color, TextureLoader, Vector2 } from 'three';
import { imgUrlBrick, imgUrlWater } from '../ultilities/srcImgurl';
import SceneWaterSurface from './../components/waterSurface/scene';

import shark from './../../3dmodel/obj/shark.obj';
import glassWhale from './../../3dmodel/obj/glass-whale.obj';
import { LoaderOBJ } from './../ultilities/object3dLoader/obj';
export default class WaterSurface {
    constructor(){
        this.$container = document.getElementById("cv-water-surface");
        this.scene = new SceneWaterSurface({
            $container : this.$container
        });
        this.init();
    }
    init(){
        this.scene.setDataUniformsBuffer();
        this.scene.setDataUniformsBufferPlane();
        this.scene.setDataUniformsModel({
            ior : 0.0,
            colorReflect : new Color("#fff"),
            colorRefraction : new Color("#fff"),
            isRefract : true
        });
        this.scene.bgWall = new TextureLoader().load(imgUrlWater);
        this.scene.bgWallSize = new Vector2(2048, 1024);
        this.scene.modelSrc = glassWhale;
        this.scene.isModelNotTransparent = false;
        this.scene.textureWaterSurface = new TextureLoader().load(imgUrlBrick);
        this.scene.transition = () => {
            this.scene.modelMesh.rotation.y += 0.005;
        };
        this.scene.modelName = "model-main";
        // setTimeout(() => {
        //     new LoaderOBJ({
        //         src : shark,
        //         resolve : (obj) => {
        //             const mesh = obj.children[0];
        //             this.scene.replaceModel(this.scene.modelName, mesh);
        //         }
        //     })
        // }, 5000);


        this.scene.init();
    }
}