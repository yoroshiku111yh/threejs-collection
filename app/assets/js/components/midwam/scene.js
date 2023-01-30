/// tutorial and code research from Yuri Artiukh
import { clearColorDark } from './../../ultilities/variable';
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';
import { LoaderGLTF } from './../../ultilities/object3dLoader/gltf';

import { GUI } from '../../three/jsm/libs/lil-gui.module.min.js';

import { EffectComposer } from '../../three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../../three/jsm/postprocessing/UnrealBloomPass.js';
import { LoaderOBJ } from './../../ultilities/object3dLoader/obj';

const params = {
    exposure: 0.5,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0,
    roughness : 0.05
};

export default class SceneMidWam extends SceneBase {
    constructor({ $container, $size = {} }) {
        super($container, $size.width, $size.height);
        this.srcModel = document.getElementById("src-model-glb").dataset.src;
        this.srcEnv = document.getElementById("src-env").dataset.src;
        this.loadTex = new THREE.TextureLoader();
        this.envMap = null;
        this.modelHuman = null;
        this.time = 0.0;
        this.userData = {};
        this.init();
    }
    async init() {
        this.start();
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0x050505), 1);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = params.exposure;
        this.initCamera();
        this.initPost();
        this.light();
        this.makePmremGenerator();
        this.texture = await this.loadTex.loadAsync(this.srcEnv);
        this.envMap = this.pmremGenerator.fromEquirectangular(this.texture).texture;
        //this.envMap.mapping = THREE.EquirectangularReflectionMapping;
        this.pmremGenerator.dispose();
        this.loadAssets();
        this.gui();
        this.update();
    }
    initPost() {

        this.renderScene = new RenderPass(this.mainScene, this.camera);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.85
        );
        this.bloomPass.threshold = params.bloomThreshold;
        this.bloomPass.radius = params.bloomRadius;
        this.bloomPass.strength = params.bloomStrength;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(this.renderScene);
        this.composer.addPass(this.bloomPass);

        console.log(this.composer);
    }
    gui() {
        const gui = new GUI();

        gui.add(params, 'exposure', 0.1, 2).onChange((value) => {
            //this.renderer.toneMappingExposure = Math.pow(value, 4.0);
            this.renderer.toneMappingExposure = value;
        });

        gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange((value) => {

            this.bloomPass.threshold = Number(value);

        });

        gui.add(params, 'bloomStrength', 0.0, 3.0).onChange((value) => {

            this.bloomPass.strength = Number(value);

        });

        gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange((value) => {

            this.bloomPass.radius = Number(value);

        });

        gui.add(params, 'roughness', 0.0, 1.0).step(0.01).onChange((value) => {

            this.userData.material.roughness = value;

        });

    }
    updateCallback() {
        this.renderer.clear();
        this.time += 0.005;
        if (this.modelHuman) {
            this.modelHuman.rotation.y = this.time;
        }
        if (this.userData.shader) {
            this.userData.shader.uniforms.uTime.value = this.time;
            this.composer.render();
        }
    }
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(this.degCameraPerspective, this.W / this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.set(0, 9, 25);
        this.mainScene.add(this.camera);
    }
    loadAssets() {
        new LoaderGLTF({
            src: document.getElementById("src-model-glb").dataset.src,
            resolve: (obj) => {
                console.log(obj);
                this.modelHuman = obj.scene.children[0];
                //this.modelHuman = obj;
                this.modelHuman.traverse((node) => {
                    if (node instanceof THREE.Mesh) {
                        this.setMaterialMidwam(node);
                        node.material.onBeforeCompile = this.beforeCompile.bind(this);
                    }
                })
                this.mainScene.add(this.modelHuman);
            },
            reject: (err) => {
                console.log(err);
            }
        });

    }
    beforeCompile(shader) {
        shader.uniforms.uTime = { value: 0.0 };
        shader.fragmentShader = `
            uniform float uTime;
            
            mat4 rotationMatrix(vec3 axis, float angle) {
                axis = normalize(axis);
                float s = sin(angle);
                float c = cos(angle);
                float oc = 1.0 - c;
                
                return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                            oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                            oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                            0.0,                                0.0,                                0.0,                                1.0);
            }
            
            vec3 rotate(vec3 v, vec3 axis, float angle) {
                mat4 m = rotationMatrix(axis, angle);
                return (m * vec4(v, 1.0)).xyz;
            }
        ` +
            shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
            'include <envmap_physical_pars_fragment>',
            `
            #if defined( USE_ENVMAP )
                vec3 getIBLIrradiance( const in vec3 normal ) {
                    #if defined( ENVMAP_TYPE_CUBE_UV )
                        vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
                        vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
                        return PI * envMapColor.rgb * envMapIntensity;
                    #else
                        return vec3( 0.0 );
                    #endif
                }
                vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
                    #if defined( ENVMAP_TYPE_CUBE_UV )
                        vec3 reflectVec = reflect( - viewDir, normal );
                        // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
                        reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
                        reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

                        reflectVec = rotate(reflectVec, vec3(0.0, 0.0, 1.0), uTime*0.5);

                        vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
                        return envMapColor.rgb * envMapIntensity;
                    #else
                        return vec3( 0.0 );
                    #endif
                }
            #endif
            `
        );
        this.userData.shader = shader;
    }
    setMaterialMidwam(node) {
        node.material = new THREE.MeshStandardMaterial({
            metalness: 1,
            roughness: params.roughness
        });
        node.material.envMap = this.envMap;
        node.material.needsUpdate = true;
        this.userData.material = node.material;
    }
    makePmremGenerator() {
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();
    }
    light() {
        
    }
}