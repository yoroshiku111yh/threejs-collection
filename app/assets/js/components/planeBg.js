
import * as THREE from 'three';

export default class PlaneBg {
    constructor(scene, size = {}){
        this.scene = scene;
        this.texture;
        this.plane;
        this.size = size;
        this.imageUpdated = false;
        this.sizeUpdated = false;
    }
    updateSize(width, height){
        this.size.width = width;
        this.size.height = height;
        this.sizeUpdated = true;
    }

    setTexture(texture){
        this.texture = texture;
        this.imageUpdated = true;
    }

    createPlane(){
        const geo = new THREE.PlaneGeometry(this.size.width, this.size.height);
        const mat = this.createMaterial();
        this.plane = new THREE.Mesh(geo, mat);
        this.addPlane();
    }

    addPlane(){
        if(!this.plane) return;
        this.scene.add(this.plane);
        this.plane.position.set(0, 0, 0);
    }

    createMaterial(){
        if(!this.texture){
            return new THREE.MeshBasicMaterial({
                color : new THREE.Color(0xcccccc)
            });
        }
        let mat = new THREE.MeshBasicMaterial({
            map : new THREE.TextureLoader().load(this.texture)
        });
        return mat;
    }

    removePlane(){
        this.scene.remove(this.plane);
        this.plane = null;
    }

    update(){
        if(!this.plane){
            this.createPlane();
        }
        if(this.sizeUpdated){
            this.removePlane();
            this.createPlane();
            this.sizeUpdated = false;
            this.imageUpdated = false;
        }
        if(this.imageUpdated){
            this.plane.material = this.createMaterial();
            this.imageUpdated = false;
        }
    }
}