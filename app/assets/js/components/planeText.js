import * as THREE from 'three';
import { scaleLandmark } from '../helpers/landmarksHelper';

export default class PlaneText{
    constructor(scene,sizeDimension = {}){
        this.scene = scene;
        this.group = new THREE.Group();
        this.plane;
        this.scale = 1;
        this.sizeDimension = sizeDimension;
    }
    create(){
        const geo = new THREE.PlaneGeometry(200, 100);
        const mat = new THREE.MeshBasicMaterial({ color : new THREE.Color("#2e8ab8")});
        this.plane = new THREE.Mesh(geo, mat);
        
        const bbox = new THREE.Box3().setFromObject(this.plane);
        this.scaleFactor = bbox.getSize(new THREE.Vector3()).x;

        this.group.add(this.plane);
        this.scene.add(this.group);
    }
    hide(){
        this.plane.visible = false;
    }
    show(){
        this.plane.visible = true;
    }
    setPosition(landmarks){
        const { width, height } = this.sizeDimension;
        const modifiedTopHeadLandMarks = {
            x : landmarks[10].x,
            y : landmarks[10].y,
            z : landmarks[10].z
        }
        let topHead = scaleLandmark(modifiedTopHeadLandMarks, width, height);
        let Z = Math.max(topHead.z, 30);
        this.plane.position.set( topHead.x, topHead.y*1.25, Z);
    }
    scalePlane(landmarks){
        const { width, height } = this.sizeDimension;
        let leftEyeUpper1 = scaleLandmark(landmarks[264], width, height);
        let rightEyeUpper1 = scaleLandmark(landmarks[34], width, height);
        const eyeDist = Math.sqrt(
            ( leftEyeUpper1.x - rightEyeUpper1.x ) ** 2 +
            ( leftEyeUpper1.y - rightEyeUpper1.y ) ** 2 +
            ( leftEyeUpper1.z - rightEyeUpper1.z ) ** 2
          );
        this.scale = eyeDist / this.scaleFactor;
        this.plane.scale.set(this.scale*2, this.scale*2, this.scale*2);
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
        this.group.rotation.z = zRot;
        //this.group.rotation.set(xRot, yRot);
    }
}