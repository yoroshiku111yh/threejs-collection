import * as THREE from 'three';
import { scaleLandmark } from '../helpers/landmarksHelper';

export default class PlaneMask3d {
    constructor({ scene, sizeDimension = {}, model, pointInFace, spacingMulti = {x : 1, y : 1, z : 1}, scaleMulti = { x : 1, y : 1, z : 1 }}){
        this.scene = scene;
        this.sizeDimension = sizeDimension;
        this.model = model;
        this.landmarks = [];
        this.scaleFactor = 1;
        this.pointInFace = pointInFace;
        this.spacingMulti = spacingMulti;
        this.scaleMulti = scaleMulti;
        this.group = new THREE.Group();
    }
    add(){
        if(!this.model) return;
        const bbox = new THREE.Box3().setFromObject(this.model);
        this.scaleFactor = bbox.getSize(new THREE.Vector3()).x;

        this.group.add(this.model);
        this.scene.add(this.group);
        this.hide();
    }
    setPointInFace(pointInFace){
        this.pointInFace = pointInFace;
    }
    setLandMarks(landmarks){
        this.landmarks = landmarks;
    }
    setModel(model){
        this.model = model;
    }
    hide(){
        this.model.visible = false;
    }
    show(){
        this.model.visible = true;
    }
    remove(){
        setTimeout(() => {
            this.model.visible = false;
            this.model.clear();
            this.scene.remove(this.model);
            this.model = null;
        }, 50);
    }
    setPosition(){
        const landmarks = this.landmarks;
        if(!this.model || this.landmarks.length === 0 || !this.pointInFace) return;
        const { width, height } = this.sizeDimension;
        const modifedLandmarks = {
            x : landmarks[this.pointInFace].x*this.spacingMulti.x,
            y : landmarks[this.pointInFace].y*this.spacingMulti.y,
            z : landmarks[this.pointInFace].z*this.spacingMulti.z
        };
        let posModel = scaleLandmark(modifedLandmarks, width, height);
        this.model.position.set(posModel.x, posModel.y, posModel.z);
    }
    scaleModel(){
        const landmarks = this.landmarks;
        if(!this.model || this.landmarks.length === 0) return;
        const {width, height} = this.sizeDimension;
        let leftEyeUpper = scaleLandmark(landmarks[264], width, height);
        let rightEyeUpper = scaleLandmark(landmarks[34], width, height);
        const eyeDist = Math.sqrt(
            ( leftEyeUpper.x - rightEyeUpper.x )** 2 + 
            ( leftEyeUpper.y - rightEyeUpper.y )** 2 +
            ( leftEyeUpper.z - rightEyeUpper.z )** 2
        );
        this.scale = eyeDist / this.scaleFactor;
        this.model.scale.set(this.scale*this.scaleMulti.x, this.scale*this.scaleMulti.y, this.scale*this.scaleMulti.z);
    }
    rotateFollow(){
        const landmarks = this.landmarks;
        if(!this.model || this.landmarks.length === 0) return;
        const { width, height } = this.sizeDimension;
        let midEyes = scaleLandmark(landmarks[168], width, height);
        let noseBottom = scaleLandmark(landmarks[2], width, height);
        let leftEyeInnerCorner = scaleLandmark(landmarks[463], width, height);
        let rightEyeInnerCorner = scaleLandmark(landmarks[243], width, height);
        
        let upVector = new THREE.Vector3(
            midEyes.x - noseBottom.x,
            midEyes.y - noseBottom.y,
            midEyes.z - noseBottom.z
        ).normalize();

        let sideVector = new THREE.Vector3(
            leftEyeInnerCorner.x - rightEyeInnerCorner.x,
            leftEyeInnerCorner.y - rightEyeInnerCorner.y,
            leftEyeInnerCorner.z - rightEyeInnerCorner.z,
        ).normalize();

        let zRot = new THREE.Vector3(1, 0, 0).angleTo(
            upVector.clone().projectOnPlane(
                new THREE.Vector3(0, 0, 1)
            )
        ) - (Math.PI / 2);

        let xRot = (Math.PI / 2) - new THREE.Vector3(0, 0, 1).angleTo(
            upVector.clone().projectOnPlane(
                new THREE.Vector3(1, 0, 0)
            )
        );

        let yRot = new THREE.Vector3(sideVector.x, 0, sideVector.z).angleTo(new THREE.Vector3(0, 0, 1)) - (Math.PI / 2);
        
        this.model.rotation.x = xRot;
        this.model.rotation.z = zRot;
        this.model.rotation.y = yRot; 
    }
}