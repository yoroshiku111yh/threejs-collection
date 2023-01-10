/// tutorial and code research from Yuri Artiukh
import { clearColorDark } from './../../ultilities/variable';
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';
import { LoaderGLTF } from './../../ultilities/object3dLoader/gltf';

export default class SceneMidWam extends SceneBase {
    constructor({ $container, $size = {} }) {
        super($container, $size.width, $size.height);
        this.srcModel = document.getElementById("src-model-glb").dataset.src;
        this.srcEnv = document.getElementById("src-env").dataset.src
        this.loaded = {
            modelHuman: null
        };
        this.materials = {
            human : null
        };
        this.time = 0.0;
        this.init();
    }
    init() {
        this.start();
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(clearColorDark));
        this.initCamera();
        this.makePmremGenerator();
        this.addObjects();
        this.loadAssets();
        this.light();
        this.update();
    }
    updateCallback() {
        this.renderer.clear();
        this.time += 0.005;
        if (this.loaded.modelHuman) {
            this.loaded.modelHuman.rotation.z = this.time;
        }
    }
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(this.degCameraPerspective, this.W / this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.set(0, 5, 10);
        this.mainScene.add(this.camera);
    }
    loadAssets() {
        new LoaderGLTF({
            src: document.getElementById("src-model-glb").dataset.src,
            resolve: (obj) => {
                this.loaded.modelHuman = obj.scene.children[0];
                this.loaded.modelHuman.traverse((node) => {
                    if (node instanceof THREE.Mesh) {
                        this.setMaterialMidwam(node);
                    }
                })
                this.mainScene.add(this.loaded.modelHuman);
            },
            reject: (err) => {
                console.log(err);
            }
        })
    }
    setMaterialMidwam(node){
        node.material = new THREE.MeshPhysicalMaterial({
            metalness : 1,
            roughness : 0.28,
            envMap : this.envMap
        });
    }
    makePmremGenerator(){
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();
    }
    addObjects(){
        this.envMap = new THREE.TextureLoader().load(this.srcEnv, texture => {
            this.envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
            this.pmremGenerator.dispose();
        })
    }
    light() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 50, 0);
        this.mainScene.add(hemiLight);

        //const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
        //this.mainScene.add(hemiLightHelper);


        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(- 1, 1.75, 1);
        dirLight.position.multiplyScalar(30);
        this.mainScene.add(dirLight);

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        const d = 50;

        dirLight.shadow.camera.left = - d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = - d;

        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = - 0.0001;

        //const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
        //this.mainScene.add(dirLightHelper);
    }
}