import * as THREE from 'three';
import GooeyEffect from '../../../shaders/gooey';
import { getRatio } from '../../ultilities/ulti';


export default class Tile {
    constructor({ scene, tile, effectShape, uniforms }) {
        this.scene = scene;
        this.tile = tile;
        this.texture;
        this.textureHover;
        this.uniforms = uniforms;
        this.effectShape = effectShape;
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
    }
    planeGeometry() {
        this.getBounds();
        const res = {
            width: this.isPrivate ? this.sizes.width : window.innerWidth,
            height: this.isPrivate ? this.sizes.height : window.innerHeight
        }
        this.uniforms = {...this.uniforms,...{
            u_map : { type : 't', value : this.texture },
            u_hovermap : { type : 't', value : this.textureHover },
            u_time : { value : this.clock.getElapsedTime() },
            u_mouse : { value : this.mouse },
            u_res : { value : new THREE.Vector2(res.width, res.height) },
            u_ratio : { value: getRatio(this.sizes, this.texture.image) },
            u_hoverratio : { value: getRatio(this.sizes, this.textureHover.image) },
        }};
        this.geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
        this.material = new GooeyEffect(this.effectShape, this.uniforms);
        this.mesh = new THREE.Mesh(this.geo, this.material);
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
    update() {
    }
}