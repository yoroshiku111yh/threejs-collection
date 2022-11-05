import * as THREE from 'three';
import { makeGeometry } from '../helpers/landmarksHelper';


export default class PlaneMask2d {
    constructor(scene, size = {}, landmarks = []) {
        this.scene = scene;
        this.texture;
        this.plane;
        this.size = size;
        this.imageUpdated = false;
        this.sizeUpdated = false;
        this.needsUpdate = false;
        this.landmarks = landmarks
    }
    updateSize(width, height) {
        this.size.width = width;
        this.size.height = height;
        this.sizeUpdated = true;
    }
    setTexture(texture) {
        this.texture = texture;
        this.imageUpdated = true;
    }
    updateVerticeAr(verticeAr) {
        this.verticeAr = verticeAr;
    }
    createPlane() {
        const geo = makeGeometry(this.landmarks);
        const mat = this.createMaterial();
        this.plane = new THREE.Mesh(geo, mat);
        this.plane.scale.set(this.size.width, this.size.height, this.size.width);
        this.addPlane();
    }
    addPlane() {
        if (!this.plane) return;
        this.scene.add(this.plane);
        this.plane.position.set(0, 0, 0);
    }
    createMaterial() {
        if (!this.texture) {
            return new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xcccccc)
            });
        }
        let tex = new THREE.TextureLoader().load(this.texture);
        tex.flipY = false;
        let mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent : true
        });
        return mat;
    }
    removePlane() {
        this.scene.remove(this.plane);
        this.plane = null;
    }
    update() {
        if (this.needsUpdate) {
            if (this.faces != null) {
                this.removeFaces();
            }
            if (this.landmarks != null) {
                this.addFaces();
            }
            this.needsUpdate = false;
        }
    }
}