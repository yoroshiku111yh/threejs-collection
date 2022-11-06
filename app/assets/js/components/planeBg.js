
import * as THREE from 'three';

export default class PlaneBg {
    constructor(scene, size = {}, typeTex = "IMAGE"){
        this.scene = scene;
        this.texture;
        this.plane;
        this.size = size;
        this.typeTex = typeTex;
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
        let tex;
        switch(this.typeTex){
            case "IMAGE" :
                tex = this.materialTypeImage(); 
                break;
            case "VIDEO" : 
                tex = this.materialTypeVideo();
                break;
        }
        let mat = new THREE.MeshBasicMaterial({
            map : tex
        });
        return mat;
    }
    materialTypeImage(){
        return new THREE.TextureLoader().load(this.texture);
    }
    materialTypeVideo(){
        return new THREE.VideoTexture( this.texture );  
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