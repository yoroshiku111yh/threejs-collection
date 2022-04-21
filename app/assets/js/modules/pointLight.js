
import ScenePointLight from '../components/point-light/scene';
import * as THREE from 'three';
import PointLightMaterial from '../../shaders/pointLight';

export default class PointLight {
    constructor(){
        this.$container = document.getElementById("point-light-cv");
        this.scene = new ScenePointLight({
            $container : this.$container,
            size : {
                width : window.innerWidth,
                height : window.innerHeight
            }
        });
        this.mainScene = this.scene.mainScene;
        this.init();
    }
    init(){
        this.box = this.createBox();
        this.mainScene.add(this.box);

        this.light = this.createLight();
        this.mainScene.add(this.light);

        this.mainScene.background = new THREE.Color('rgba(0, 0, 0,1)');
        this.scene.setUpdateCallback(this.updateCallback.bind(this));
        this.scene.update();
    }
    createLight(){
        const light = new THREE.PointLight(0xff0000);
        const sphere = new THREE.SphereGeometry( 0.05, 16, 8 );
        light.add(new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) ))
        light.position.set(10, 5, -10);
        return light;
    }
    createBox(){
        const geo = new THREE.BoxGeometry(2, 2, 2);
        const uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            {
                diffuse : {
                    type : 'c',
                    value : new THREE.Color(0xff00ff)
                }
            }
        ]);

        const material = new PointLightMaterial(uniforms);
        const cube = new THREE.Mesh(geo, material);
        cube.position.z = -10;
        return cube;
    }
    updateCallback(){
        this.box.rotation.x += 0.005;
        this.box.rotation.y += 0.005;
    }
}