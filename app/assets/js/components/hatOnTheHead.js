import { scaleLandmark } from "../helpers/landmarksHelper";
import * as THREE from 'three';

export default class HatOnTheHead{
    constructor({ scene, sizeDimension = {}, model}){
        this.scene = scene;
        this.sizeDimension = sizeDimension;
        this.model = model;
        this.scaleFactor = 1;
        this.group = new THREE.Group();
    }
    add(){
        const bbox = new THREE.Box3().setFromObject(this.model);
        this.scaleFactor = bbox.getSize(new THREE.Vector3()).x;

        this.group.add(this.model);
        this.scene.add(this.group);
        this.model.children[0].rotation.y = 80;
        this.hide();
    }
    hide(){
        this.model.visible = false;
    }
    show(){
        this.model.visible = true;
    }
    setPosition(landmarks){
        if(!this.model) return;
        const { width, height } = this.sizeDimension;
        const modifiedTopHeadLandMarks = {
            x : landmarks[10].x,
            y : landmarks[10].y,
            z : landmarks[10].z
        }
        let topHead = scaleLandmark(modifiedTopHeadLandMarks, width, height);
        let Z = Math.max(topHead.z, 30);
        this.model.position.set( topHead.x, topHead.y, topHead.z);
    }
    scaleModel(landmarks){
        const { width, height } = this.sizeDimension;
        let leftEyeUpper1 = scaleLandmark(landmarks[264], width, height);
        let rightEyeUpper1 = scaleLandmark(landmarks[34], width, height);
        const eyeDist = Math.sqrt(
            ( leftEyeUpper1.x - rightEyeUpper1.x ) ** 2 +
            ( leftEyeUpper1.y - rightEyeUpper1.y ) ** 2 +
            ( leftEyeUpper1.z - rightEyeUpper1.z ) ** 2
          );
        this.scale = eyeDist / this.scaleFactor;
        this.model.scale.set(this.scale*2.25, this.scale*2.25, this.scale*2.35);
    }
    rotationFollow(landmarks){
        const { width, height } = this.sizeDimension;
        let midEyes = scaleLandmark(landmarks[168], width, height);
        let noseBottom = scaleLandmark(landmarks[2], width, height);
        let leftEyeInnerCorner  = scaleLandmark(landmarks[463], width, height);
        let rightEyeInnerCorner  = scaleLandmark(landmarks[243], width, height);

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
        ) - ( Math.PI / 2 );

        let xRot = ( Math.PI / 2 ) -  new THREE.Vector3(0, 0, 1).angleTo(
            upVector.clone().projectOnPlane(
                new THREE.Vector3(1, 0, 0)
            )
        );

        let yRot = new THREE.Vector3(sideVector.x, 0, sideVector.z).angleTo(new THREE.Vector3(0, 0, 1)) - ( Math.PI/2 );
        this.model.rotation.x = xRot;
        this.model.rotation.z = zRot;
        this.model.rotation.y = yRot;
    }
    remove(){
        this.model.clear();
        this.scene.remove(this.model);
        this.model = null;
        
    }
}