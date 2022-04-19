import * as THREE from 'three';
import GooeyEffect from '../../../shaders/gooey';
import { getRatio } from '../../ultilities/ulti';
import { TweenMax, Power2 } from 'gsap/gsap-core';


export default class Tile {
    constructor({ scene, tile, effectShape, uniforms = {}, duration = 0.15 }) {
        this.scene = scene;
        this.mainImage = tile.imgDom;
        this.tile = tile;
        this.texture;
        this.textureHover;
        this.uniforms = uniforms;
        this.effectShape = effectShape;
        this.duration = duration;
        this.isPrivate = true;
        this.clock = new THREE.Clock();
        this.sizes = new THREE.Vector2();
        this.offset = new THREE.Vector2();
        this.mouse = new THREE.Vector2();
        this.loader = new THREE.TextureLoader();
        this.preLoad(this.tile.imgSrc, this.tile.hoverSrc);
    }
    preLoad(src, srcHover) {
        this.loader.load(src,
            (texture) => { this.texture = texture; this.loaded(); },
            undefined,
            (error) => { console.error(error) });

        this.loader.load(srcHover,
            (textureHover) => { this.textureHover = textureHover; this.loaded(); },
            undefined,
            (error) => { console.error(error) });
    }
    loaded() {
        if (!this.texture || !this.textureHover) {
            return;
        }
        this.mainImage.classList.add("opacity--0");
        this.texture.center.set(0.5, 0.5);
        this.textureHover.center.set(0.5, 0.5);
        this.planeGeometry();
        this.bindEvent();
    }
    planeGeometry() {
        this.getBounds();
        const res = {
            width: this.isPrivate ? this.sizes.width : window.innerWidth,
            height: this.isPrivate ? this.sizes.height : window.innerHeight
        }
        this.uniforms = {...this.tile.dataUniform,...{
            u_map : { type : 't', value : this.texture },
            u_hovermap : { type : 't', value : this.textureHover },
            u_mouse : { value : this.mouse },
            u_res : { value : new THREE.Vector2(res.width, res.height) },
            u_ratio : { value: getRatio(this.sizes, this.texture.image) },
            u_hoverratio : { value: getRatio(this.sizes, this.textureHover.image) },
        }};
        this.geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
        this.material = new GooeyEffect(this.effectShape, this.uniforms);
        this.uniforms = this.material.getUniform();
        this.mesh = new THREE.Mesh(this.geo, this.material);
        this.mesh.position.x = this.offset.x,
        this.mesh.position.y = this.offset.y
        this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
        this.scene.mainScene.add(this.mesh);
    }
    getBounds(){
        const { imgDom } = this.tile;
        const { width, height, left, top } = imgDom.getBoundingClientRect();
        if (!this.sizes.equals(new THREE.Vector2(width, height))) {
            this.sizes.set(width, height)
        }
        if(this.isPrivate) return ;
        if (!this.offset.equals(new THREE.Vector2(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2))) {
            this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2)
        }
    }
    bindEvent(){
        this.mainImage.addEventListener("mousemove", (e) => { this.onPointerMove(e) });
        this.mainImage.addEventListener("mouseenter", () => { this.onPointerEnter() })
        this.mainImage.addEventListener("mouseleave", () => { this.onPointerLeave() })
    }
    onPointerLeave(){
        //if (!this.mesh || this.isZoomed || this.hasClicked || APP.Layout.isMobile) return;
        if(!this.mesh) return;
        TweenMax.to(this.uniforms.u_progressHover, this.duration, {
            value: 0,
            ease: Power2.easeInOut,
            onComplete: () => {
                this.isHovering = false
            }
        })
    }
    onPointerEnter(){
        this.isHovering = true;
        TweenMax.to(this.uniforms.u_progressHover, this.duration, {
            value : 1
        })
    }
    onPointerMove(event){
        const { left, top } = this.mainImage.getBoundingClientRect();
        if(this.isPrivate){
            TweenMax.to(this.mouse, this.duration, {
                x : event.clientX - left,
                y : event.clientY - top
            })
        }
        else{
            TweenMax.to(this.mouse, this.duration, {
                x : event.clientX,
                y : event.clientY
            })
        }
    }
    move(){
        this.getBounds()
        TweenMax.set(this.mesh.position, {
            x: this.offset.x,
            y: this.offset.y,
        });
        let delta = 0;
        TweenMax.to(this.mesh.scale, 0.3, {
            x: this.sizes.x - delta,
            y: this.sizes.y - delta,
            z: 1,
        })
    }
    update() {
        if (!this.mesh) return;
        this.move();
        if (!this.isHovering) return;
        this.uniforms.u_time.value += this.clock.getDelta();
    }
    
}