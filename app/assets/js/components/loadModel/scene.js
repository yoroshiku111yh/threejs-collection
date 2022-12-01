
import { LoaderGLTF } from '../../ultilities/object3dLoader/gltf';
import SceneBase from './../../ultilities/sceneBase';
import { clearColorDark } from './../../ultilities/variable';
import * as THREE from 'three';
import { OrbitControls } from '../../ultilities/jsm/controls/orbitControls';

export default class SceneLoadModel extends SceneBase {
    constructor({ $container, size = {} }) {
        super($container, size.width, size.height)
        this.init();
    }
    init() {
        this.start();
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(clearColorDark));
        this.light();
        this.initCamera();
        this.control = new OrbitControls(this.camera, this.renderer.domElement);
        this.loadModel();
        this.ground();
        this.update();
    }
    light() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 50, 0);
        this.mainScene.add(hemiLight);

        const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
        this.mainScene.add(hemiLightHelper);


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

        const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
        this.mainScene.add(dirLightHelper);
    }
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(this.degCameraPerspective, this.W / this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.set(15, 5, 20);
        this.mainScene.add(this.camera);
    }
    loadModel() {
        new LoaderGLTF({
            src: document.getElementById("src-model-glb").dataset.src,
            resolve: (obj) => {
                console.log(obj);
                this.mainScene.add(obj.scene);
            },
            reject: (err) => {
                console.log(err);
            }
        })
    }
    updateCallback() {
        this.control.update();
        this.renderer.clear();
    }

    ground() {
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        groundMat.color.setHSL(0.095, 1, 0.75);

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -2;
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.mainScene.add(ground);
    }
}