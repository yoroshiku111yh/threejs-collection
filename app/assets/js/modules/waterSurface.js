
import { Color, TextureLoader, Vector2 } from 'three';
import { imgUrlBlack, imgUrlDeepSea, imgUrlWater } from '../ultilities/srcImgurl';
import SceneWaterSurface from './../components/waterSurface/scene';

import shark from './../../3dmodel/obj/shark.obj';
import glassWhale from './../../3dmodel/obj/glass-whale.obj';
import { LoaderOBJ } from './../ultilities/object3dLoader/obj';
import { TweenMax, Power1 } from 'gsap/gsap-core';

import { Pane } from 'tweakpane';

export default class WaterSurface {
    constructor() {
        this.$container = document.getElementById("cv-water-surface");
        this.scene = new SceneWaterSurface({
            $container: this.$container
        });
        this.pane = new Pane();
        this.PARAMS = {
            ior: 0.99,
            "m-clear": true,
            "m-refract": true,
            "auto-wave": true,
            "models" : [
                { text: 'Glass Whale', value: glassWhale },
                { text: 'Shark', value: shark }
            ],
            "model" : shark
        }
        this.init();
        if(window.innerWidth > 767){
            this.addPane();
        }
    }
    init() {
        this.scene.setDataUniformsBuffer();
        this.scene.setDataUniformsBufferPlane();
        this.scene.setDataUniformsModel({
            ior: 0.0,
            colorReflect: new Color("#fff"),
            colorRefraction: new Color("rgb(255, 245, 245)"),
            isRefract: this.PARAMS.isRefract
        });
        this.scene.bgWall = new TextureLoader().load(imgUrlDeepSea);
        this.scene.bgWallSize = new Vector2(1074, 806);
        this.scene.isModelNotTransparent = !this.PARAMS["m-clear"];
        this.scene.textureWaterSurface = new TextureLoader().load(imgUrlBlack);
        this.scene.transition = () => {
            this.scene.modelMesh.rotation.y += 0.005;
            if (!this.isStarted) return;
            /// PANE
            this.renderPane();
        };
        this.scene.modelName = "model-main";
        this.scene.init();

        new LoaderOBJ({
            src: this.PARAMS.model,
            resolve: (obj) => {
                const mesh = obj.children[0];
                this.scene.replaceModel(this.scene.modelName, mesh);
                this.startup();
            }
        })
    }
    startup() {
        TweenMax.to(this.scene.dataUniformsModel.ior, 2., {
            value: 0.99,
            ease: Power1.easeInOut,
            onComplete: () => {
                this.isStarted = true;
            }
        })
    }
    renderPane() {
        this.scene.dataUniformsModel.ior.value = this.PARAMS.ior;
        this.scene.isModelNotTransparent = !this.PARAMS["m-clear"];
        this.scene.dataUniformsModel.isRefract.value = this.PARAMS["m-refract"];
        this.scene.dataUniformsBuffer.isAutoRegeneratorWaterDrop.value = this.PARAMS["auto-wave"];
    }
    addPane() {
        this.pane.addInput(this.PARAMS, "ior", {
            min: 0.0,
            max: 1.15
        });
        this.pane.addInput(this.PARAMS, "m-clear");
        this.pane.addInput(this.PARAMS, "m-refract");
        this.pane.addInput(this.PARAMS, "auto-wave");
        this.pane.addBlade({
            view: 'list',
            label: 'change-model',
            options: this.PARAMS.models,
            value: this.PARAMS.model,
        });


        ////////////event
        this.pane.on('change', (ev) => {
            if(ev.target.label === "change-model"){
                if(this.PARAMS.model !== ev.value ){
                    this.PARAMS.model = ev.value;
                    new LoaderOBJ({
                        src : ev.value,
                        resolve : (obj) => {
                            const mesh = obj.children[0];
                            this.scene.replaceModel(this.scene.modelName, mesh);
                        }
                    })
                }
            }
        })
    }
}

/// tweakpane
/// ior
/// model
/// bool transparent model
/// bool refract
/// bool auto regenator water drop