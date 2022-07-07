
import { Color, TextureLoader, Vector2 } from 'three';
import * as THREE from 'three';
import { imgUrlBlack, imgUrlEnvNightShanghai } from '../ultilities/srcImgurl';
import SceneWaterSurface from './../components/waterSurface/scene';

import shark from './../../3dmodel/obj/shark.obj';
import glassWhale from './../../3dmodel/obj/glass-whale.obj';
import icosahedron from './../../3dmodel/obj/icosahedron.obj';
import { LoaderOBJ } from './../ultilities/object3dLoader/obj';
import { TweenMax, Power1 } from 'gsap/gsap-core';

import { Pane } from 'tweakpane';
import { imgUrlBannerText } from './../ultilities/srcImgurl';
import { LoadNewCubeMap } from '../ultilities/jsm/loaders/cubemap';

export default class WaterSurface {
    constructor() {
        this.$container = document.getElementById("cv-water-surface");
        this.scene = new SceneWaterSurface({
            $container: this.$container
        });
        this.pane = new Pane();
        this.pathSrcNeon1 = document.querySelector("#pathSrcNeon1").dataset.path;
        this.pathSrcNeon2 = document.querySelector("#pathSrcNeon2").dataset.path;
        this.pathSrcNeon3 = document.querySelector("#pathSrcNeon3").dataset.path;
        this.pathSrcNeon4 = document.querySelector("#pathSrcNeon4").dataset.path;
        this.pathSrcNeon5 = document.querySelector("#pathSrcNeon5").dataset.path;
        this.pathSrcNeon6 = document.querySelector("#pathSrcNeon6").dataset.path;
        this.cubeMap = [];
        this.PARAMS = {
            ior: 2.0,
            power: 3.,
            bias: 0.,
            scale: 1.0,
            "m-clear": true,
            "m-refract": true,
            "auto-wave": true,
            useLightColorEnv: false,
            "models": [
                { text: 'Glass Whale', value: glassWhale },
                { text: 'Shark', value: shark },
                { text: 'icosahedron', value: icosahedron }
            ],
            "model": icosahedron,
            "cubeMaps": [
                { text: 'Neon 1', value: 0 },
                { text: 'Neon 2', value: 1 },
                { text: 'Neon 3', value: 2 },
                { text: 'Neon 4', value: 3 },
                { text: 'Neon 5', value: 4 },
                { text: 'Neon 6', value: 5 },
            ],
            "cubeMapIndex": 0,
            "enabled-Refraction-color": false,
            "zPosition": -4.88,
            "zVertex": 0.46,
            "zWorldPosition": 3.0,
            "blur" : 4.35,
            "rangeFollow" : 10.0,
            "powerRefract" : 0.15
        }
        if (window.innerWidth > 767) {
            this.addPane();
        }

        this.enableUploadBannerImage = true;
        console.log(this.enableUploadBannerImage);
        this.bannerImage = imgUrlBannerText;
        this.bannerImageSize = new Vector2(1899, 838);

        if (this.enableUploadBannerImage) {
            this.uploadBannerImage();
        }
        else {
            this.init();
        }
    }
    uploadBannerImage() {
        const uploadElm = document.getElementById("uploadFile");
        uploadElm.addEventListener('change', (e) => {
            const _this = e.currentTarget;
            if (!_this.files) return;
            const src = URL.createObjectURL(_this.files[0]);
            const img = document.createElement("img");
            img.src = src;
            img.onload = () => {
                this.bannerImageSize = new THREE.Vector2(img.width, img.height);
                this.bannerImage = src;
                this.init();
            }
        })
    }
    init() {
        this.loadCubeMap();
        this.scene.setDataUniformsBuffer();
        this.scene.setDataUniformsBufferPlane();
        this.scene.setDataUniformsModel({
            ior: 0.99,
            colorReflect: new Color("#fff"),
            colorRefraction: new Color("rgb(255, 245, 245)"),
            isRefract: this.PARAMS.isRefract,
            envCubeMap: this.cubeMap[this.PARAMS.cubeMapIndex],
            isHaveEnvCubeMap: true,
            power: this.PARAMS.power,
            scale: this.PARAMS.scale,
            bias: this.PARAMS.bias,
            isHaveEnvCubeMap: !this.PARAMS.useLightColorEnv,
            isEnableRefractionColor: this.PARAMS['enabled-Refraction-color'],
            zVertex: this.PARAMS.zVertex,
            zWorldPosition: this.PARAMS.zWorldPosition,
            powerBlur : this.PARAMS.blur,
            powerRefract : this.PARAMS.powerRefract
        });
        this.scene.zPositionModel = this.PARAMS.zPosition;
        this.scene.bgWall = new TextureLoader().load(this.bannerImage);
        this.scene.bgWallSize = this.bannerImageSize;
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
        /////////
        this.eventMouse();
        /////////
        new LoaderOBJ({
            src: this.PARAMS.model,
            resolve: (obj) => {
                const mesh = obj.children[0];
                this.scene.replaceModel(this.scene.modelName, mesh);
                this.startup();
            }
        })
    }
    loadCubeMap() {
        new LoadNewCubeMap({
            path: this.pathSrcNeon1,
            resolve: (cubemap) => { this.cubeMap[0] = cubemap; }
        });
        new LoadNewCubeMap({
            path: this.pathSrcNeon2,
            resolve: (cubemap) => { this.cubeMap[1] = cubemap; }
        });
        new LoadNewCubeMap({
            path: this.pathSrcNeon3,
            resolve: (cubemap) => { this.cubeMap[2] = cubemap; }
        });
        new LoadNewCubeMap({
            path: this.pathSrcNeon4,
            resolve: (cubemap) => { this.cubeMap[3] = cubemap; }
        });
        new LoadNewCubeMap({
            path: this.pathSrcNeon5,
            resolve: (cubemap) => { this.cubeMap[4] = cubemap; }
        });
        new LoadNewCubeMap({
            path: this.pathSrcNeon6,
            resolve: (cubemap) => { this.cubeMap[5] = cubemap; }
        });
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
        this.scene.dataUniformsModel.power.value = this.PARAMS.power;
        this.scene.dataUniformsModel.bias.value = this.PARAMS.bias;
        this.scene.dataUniformsModel.scale.value = this.PARAMS.scale;
        this.scene.dataUniformsModel.envCubeMap.value = this.cubeMap[this.PARAMS.cubeMapIndex];
        this.scene.dataUniformsModel.isHaveEnvCubeMap.value = !this.PARAMS.useLightColorEnv;
        this.scene.dataUniformsModel.isEnableRefractionColor.value = this.PARAMS['enabled-Refraction-color'];
        /////////
        this.scene.modelMesh.position.z = this.PARAMS.zPosition;
        this.scene.dataUniformsModel.zVertex.value = this.PARAMS.zVertex;
        this.scene.dataUniformsModel.zWorldPosition.value = this.PARAMS.zWorldPosition;
        this.scene.dataUniformsModel.powerBlur.value = this.PARAMS.blur;
        this.scene.dataUniformsModel.powerRefract.value = this.PARAMS.powerRefract;
    }
    eventMouse() {
        if ("ontouchmove" in window) {
            window.addEventListener("touchstart", (e) => {
                //this.scene.eventMouseDown();
            });
            window.addEventListener("touchmove", (e) => {
                //this.scene.eventMouseMove(e);
                if (window.innerWidth > 768) {
                    this.scene.followMouseFn(e, this.PARAMS.rangeFollow);
                }
            });
            window.addEventListener("touchend", () => {
                //this.scene.eventMouseUp();
            });
        } else {
            window.addEventListener("mousedown", () => {
                //this.scene.eventMouseDown();
            });
            window.addEventListener("mousemove", (e) => {
                //this.scene.eventMouseMove(e);
                if (window.innerWidth > 768) {
                    this.scene.followMouseFn(e, this.PARAMS.rangeFollow);
                }
            });
            window.addEventListener("mouseup", () => {
                //this.scene.eventMouseUp();
            });
        }
    }
    addPane() {
        this.pane.addInput(this.PARAMS, "ior", {
            min: 0.0,
            max: 3.0//1.15
        });
        this.pane.addInput(this.PARAMS, "power", {
            min: 0.0,
            max: 3.0
        });
        this.pane.addInput(this.PARAMS, "bias", {
            min: 0.0,
            max: 1.0
        });
        this.pane.addInput(this.PARAMS, "scale", {
            min: 0.0,
            max: 1.0
        });
        this.pane.addInput(this.PARAMS, "m-clear");
        this.pane.addInput(this.PARAMS, "m-refract");
        this.pane.addInput(this.PARAMS, "auto-wave");
        this.pane.addInput(this.PARAMS, "useLightColorEnv");
        this.pane.addBlade({
            view: 'list',
            label: 'change-model',
            options: this.PARAMS.models,
            value: this.PARAMS.model,
        });

        this.pane.addBlade({
            view: 'list',
            label: 'change-envLight',
            options: this.PARAMS.cubeMaps,
            value: this.PARAMS.cubeMapIndex,
        });

        this.pane.addInput(this.PARAMS, "enabled-Refraction-color");
        this.pane.addInput(this.PARAMS, "zVertex", {
            min: 0.0,
            max: 3.0
        });
        this.pane.addInput(this.PARAMS, "zPosition", {
            min: -7.0,
            max: 1.0
        });
        this.pane.addInput(this.PARAMS, "zWorldPosition", {
            min: 1.0,
            max: 5.0
        });
        this.pane.addInput(this.PARAMS, "blur", {
            min: 0.0,
            max: 50.0
        });
        this.pane.addInput(this.PARAMS, "rangeFollow", {
            min: 0.0,
            max: 20.0
        });
        this.pane.addInput(this.PARAMS, "powerRefract", {
            min: 0.0,
            max: 2.0
        });
        ////////////event   
        this.pane.on('change', (ev) => {
            if (ev.target.label === "change-model") {
                if (this.PARAMS.model !== ev.value) {
                    this.PARAMS.model = ev.value;
                    new LoaderOBJ({
                        src: ev.value,
                        resolve: (obj) => {
                            const mesh = obj.children[0];
                            this.scene.replaceModel(this.scene.modelName, mesh);
                        }
                    })
                }
            }

            if (ev.target.label === "change-envLight") {
                if (this.PARAMS.cubeMapIndex !== ev.value) {
                    this.PARAMS.cubeMapIndex = ev.value;
                }
            }
        })
    }
}
