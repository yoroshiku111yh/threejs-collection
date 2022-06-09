import * as THREE from 'three';
import SceneBase from './../../ultilities/sceneBase';
import { clearColorDark } from './../../ultilities/variable';
import { TweenMax } from 'gsap/gsap-core';
import { Bounce, Elastic } from 'gsap';

export default class SceneMeshMorpher extends SceneBase {
    constructor({ $container, size = {}, models }) {
        super($container, size.width, size.height);
        this.geometries = [];
        this.vertexOffset = [];
        this.models = models;
        this.init();
    }
    init() {
        this.start();
        this.renderer.setClearColor(clearColorDark);
        this.initPerspectiveCamera();
        this.addDirectionLight();
        this.addFiles();
        TweenMax.to(this.mesh.morphTargetInfluences, {
            '0' : 1,
        }, 3.);
        this.update();
    }
    addDirectionLight() {
        this.light = new THREE.DirectionalLight(0xfff0dd, 1);
        this.light.position.set(0, 5, 10);
        this.mainScene.add(this.light);
    }
    addFiles() {
        const geoTarget = this.models[0].geometry.clone();
        const geoMorphTarget = this.models[1].geometry.clone();

        const mat = new THREE.MeshPhongMaterial({
            color : 0xFF0000,
            flatShading : true
        });

        const finalGeo = this.setMorpherTarget(geoTarget, geoMorphTarget);

        this.mesh = new THREE.Mesh(finalGeo, mat);
        this.mainScene.add(this.mesh);
    }
    setMorpherTarget(target, morphTarget) {
        const attributesTarget = target.attributes;
        const attributesMorphTarget = morphTarget.attributes;

        const lengthTarget = attributesTarget.position.count;
        const lengthMorphTarget = attributesMorphTarget.position.count;

        target.morphAttributes.position = [];

        const _ar = [];
        for (let i = 0; i < lengthTarget; i++) {
            let j = i < lengthMorphTarget ? i : lengthMorphTarget - 1;
            const x = attributesMorphTarget.position.getX(j);
            const y = attributesMorphTarget.position.getY(j);
            const z = attributesMorphTarget.position.getZ(j);
            _ar.push(x, y, z);
        }
        target.morphAttributes.position[0] = new THREE.Float32BufferAttribute(_ar, 3);
        return target;
    }
    updateCallback() {
        this.mesh.rotation.y += 0.01;
    }
}