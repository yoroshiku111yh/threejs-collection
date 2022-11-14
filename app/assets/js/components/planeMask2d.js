import * as THREE from 'three';
import { makeGeometry } from '../helpers/landmarksHelper';
import { clone } from './../utils/jsm/SkeletonUtils';

export default class PlaneMask2d {
    constructor(scene, sizeDimension = {}, landmarks = []) {
        this.scene = scene;
        this.texture;
        this.plane;
        this.sizeDimension = sizeDimension;
        this.imageUpdated = false;
        this.sizeUpdated = false;
        this.needsUpdate = false;
        this.landmarks = landmarks
    }
    updateSize(width, height) {
        this.sizeDimension.width = width;
        this.sizeDimension.height = height;
        this.sizeUpdated = true;
    }
    setTexture(texture) {
        this.texture = texture;
        this.imageUpdated = true;
    }
    setLandMarks(landmarks){
        this.landmarks = landmarks;
    }
    createPlane() {
        this.geo = makeGeometry(this.landmarks);
        this.mat = this.createMaterial();
        this.plane = new THREE.Mesh(this.geo, this.mat);
        this.plane.scale.set(this.sizeDimension.width, this.sizeDimension.height, this.sizeDimension.width);
        this.addPlane();
    }
    addPlane() {
        if (!this.plane) return;
        this.scene.add(this.plane);
        this.plane.position.set(0, 0, 0);
    }
    setGeometry(){
        this.plane.geometry = makeGeometry(this.landmarks);
        this.plane.geometry.verticesNeedUpdate = true;
    }
    createMaterial() {
        if (!this.texture) {
            return new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xcccccc)
            });
        }
        let tex = new THREE.TextureLoader().load(this.texture);
        tex.flipY = false;
        //this.texture.flipY = false;
        let mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent : true
        });
        return mat;
    }
    remove() {
        setTimeout(() => {
            this.scene.remove(this.plane);
            this.plane = null;
        }, 1)
    }
    hide(){
        if(!this.plane) return;
        this.plane.visible = false;
    }
    show(){
        if(!this.plane) return;
        this.plane.visible = true;
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