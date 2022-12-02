

import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';
import ShaderRayMarchingBasic from './../../../shaders/rayMarchingBasic/index';

export default class SceneRaymarchingBasic extends SceneBase {
    constructor({ $container, size = {} }) {
        super($container, size.width, size.height);
        this.frustumSize = 1;
        this.time = 0;
        this.speed = 0.025;
        this.isPlaying = true;
        this.isMouseLeave = true;
        this.mouse = new THREE.Vector2();
        this.resolution = new THREE.Vector4();
        this.init();
    }
    initCamera() {
        this.camera = new THREE.OrthographicCamera(
            this.frustumSize / -2,
            this.frustumSize / 2,
            this.frustumSize / 2,
            this.frustumSize / -2,
            -1000,
            1000
        );
        this.camera.position.set(0, 0, 2);
    }
    init() {
        this.start();
        this.renderer.setClearColor(0x000000, 1);
        this.initCamera();
        //
        //this.stop();
        //
        this.addPlane();
        this.resize();
        this.mouseEvents();
        //
        this.eventResize();
        this.update();
    }
    eventResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }
    resize() {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.renderer.setSize(this.W, this.H);
        this.camera.aspect = this.W / this.H;

        /// aspect image cover
        ///-----------
        let a1, a2;
        this.imageAspect = 1;
        if (this.H / this.W > this.imageAspect) {
            a1 = (this.W / this.H) * this.imageAspect;
            a2 = 1;
        } else {
            a1 = 1;
            a2 = (this.H / this.W) / this.imageAspect;
        }
        this.uniforms.resolution.value.x = this.W;
        this.uniforms.resolution.value.y = this.H;
        this.uniforms.resolution.value.z = a1;
        this.uniforms.resolution.value.w = a2;
        ///

        const dist = this.camera.position.z;
        const height = 1;
        this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

        this.camera.updateProjectionMatrix();
    }
    addPlane() {
        const material = new ShaderRayMarchingBasic({
            time: {
                value: 0
            },
            progress: {
                value: 0
            },
            mouse: {
                value: this.mouse
            },
            resolution: {
                value: this.resolution
            },
            totalOrb: {
                value: 5
            },
            colorOrb: {
                value: new THREE.Vector3(new THREE.Color("#040809").r, new THREE.Color("#040809").g, new THREE.Color("#040809").b)
            },
            isMouseLeave : {
                value : this.isMouseLeave
            }
        });
        this.uniforms = material.getUniform();
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.plane = new THREE.Mesh(geo, material);
        this.mainScene.add(this.plane);
    }
    stop() {
        this.isPlaying = false;
    }
    play() {
        this.isPlaying = true;
    }
    mouseEvents() {
        document.addEventListener("mousemove", (e) => {
            this.mouse.x = e.pageX / this.W - 0.5;
            this.mouse.y = -e.pageY / this.H + 0.5;
            this.isMouseLeave = false;
        });
        document.addEventListener("mouseleave", () =>{
            this.isMouseLeave = true;
        })
    }
    updateCallback() {
        if (!this.isPlaying) return;
        this.time += this.speed;
        this.uniforms.time.value = this.time;
        this.uniforms.progress.value = this.progress;
        this.uniforms.isMouseLeave.value = this.isMouseLeave;
    }
}