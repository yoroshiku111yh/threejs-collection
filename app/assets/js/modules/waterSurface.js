
import { Color, MathUtils, TextureLoader, Vector2 } from 'three';
import { imgUrlDeepSea, imgUrlWater } from '../ultilities/srcImgurl';
import SceneWaterSurface from './../components/waterSurface/scene';

import shark from './../../3dmodel/obj/shark.obj';
import glassWhale from './../../3dmodel/obj/glass-whale.obj';
import { LoaderOBJ } from './../ultilities/object3dLoader/obj';
import { TweenMax, Power1 } from 'gsap/gsap-core';
export default class WaterSurface {
    constructor() {
        this.$container = document.getElementById("cv-water-surface");
        this.scene = new SceneWaterSurface({
            $container: this.$container
        });
        this.init();
    }
    init() {
        this.scene.setDataUniformsBuffer();
        this.scene.setDataUniformsBufferPlane();
        this.scene.setDataUniformsModel({
            ior: 0.0,
            colorReflect: new Color("#fff"),
            colorRefraction: new Color("rgb(255, 245, 245)"),
            isRefract: true
        });
        this.scene.bgWall = new TextureLoader().load(imgUrlDeepSea);
        this.scene.bgWallSize = new Vector2(2048, 1024);
        this.scene.isModelNotTransparent = false;
        this.scene.textureWaterSurface = new TextureLoader().load(imgUrlWater);
        this.scene.transition = () => {
            this.scene.modelMesh.rotation.y += 0.005;
        };
        this.scene.modelName = "model-main";
        this.scene.init();

        new LoaderOBJ({
            src : glassWhale,
            resolve : (obj) => {
                const mesh = obj.children[0];
                this.scene.replaceModel(this.scene.modelName, mesh);
                this.startup();
            }
        })
    }
    startup(){
        TweenMax.to(this.scene.dataUniformsModel.ior, 2., {
            value : 0.99,
            ease :Power1.easeInOut,
            delay : 1.
        })
    }
}

/// tweakpane 
/// ior
/// model
/// bool transparent model
/// bool refract
/// bool auto regenator water drop