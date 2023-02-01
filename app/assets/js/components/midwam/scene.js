/// tutorial and code research from Yuri Artiukh
/// https://www.youtube.com/watch?v=Vr9l4m6bkcQ&ab_channel=YuriArtiukh
import { clearColorDark } from './../../ultilities/variable';
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';
import { LoaderGLTF } from './../../ultilities/object3dLoader/gltf';

import { GUI } from '../../three/jsm/libs/lil-gui.module.min.js';

import { EffectComposer } from '../../three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../../three/jsm/postprocessing/UnrealBloomPass.js';
import { HoloScreenShader } from './holoScreen';
import { ShaderPass } from '../../three/jsm/postprocessing/ShaderPass';
import { gsap } from 'gsap';

const params = {
    exposure: 0.63,
    bloomStrength: 0.75,
    bloomThreshold: 0.028,
    bloomRadius: 0,
    roughness: 0.14,
    metalness: 1,
    powerHolo: 0.,
    glitchHolo: 1.0,
    progress: 0.0,
};

const cameraAnimation = {
    step1: new THREE.Vector3(0, 18, 1),
    step2: new THREE.Vector3(0, 17, 7),
    step3: new THREE.Vector3(0, 10, 10)
}

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
        this.tl = gsap.timeline();
        console.log("DAMAGE TO LOW GPU")
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
        this.loadAssets(() => {
            this.testAnimation();
        });
        this.gui();
        this.update();
    }
    testAnimation() {
        const camera = this.camera.position;
        const model = this.modelHuman;
        const holoScreen = this.holoScreen.uniforms;
        const bloom = this.bloomPass;
        this.tl.to(camera, {
            x: cameraAnimation["step2"].x,
            y: cameraAnimation["step2"].y,
            z: cameraAnimation["step2"].z,
            duration : 0.75,
            delay : 1.5
        }, 'stage1')
        .to(model.rotation, { 
            y : -1 ,
            duration : 0.75,
            delay : 1.5
        },'stage1')
        .to(bloom, { 
            strength : 1.2,
            threshold : 0.017,
            duration : 0.75,
            delay : 2
        }, 'stage1')
        .to(model.rotation, {
            y : -3.5,
            duration : 1,
            delay : 2
        }, 'stage2')
        .to(camera, {
            x: cameraAnimation["step3"].x,
            y: cameraAnimation["step3"].y,
            z: cameraAnimation["step3"].z,
            duration : 0.75,
            delay : 2
        }, 'stage2')
        .to(holoScreen.powerHolo, {
            value : 0.3,
            duration : 0.75,
            delay : 2
        }, 'stage2')
        .to(holoScreen.glitchHolo, {
            value : 5.46,
            duration : 0.75,
            delay : 2
        }, 'stage2')
        .to(holoScreen.progress, {
            value : 0.82,
            duration : 0.75,
            delay : 2
        }, 'stage2')
        
        // threshold : 0.017,
        // strength : 1.413,

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


        this.holoScreen = new ShaderPass(HoloScreenShader);
        this.composer.addPass(this.holoScreen);
    }
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(this.degCameraPerspective, this.W / this.H, this.minPerspective, this.maxPerspective);
        this.camera.position.x = cameraAnimation['step1'].x;
        this.camera.position.y = cameraAnimation['step1'].y;
        this.camera.position.z = cameraAnimation['step1'].z;
        this.mainScene.add(this.camera);
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

        gui.add(params, 'metalness', 0.0, 1.0).step(0.01).onChange((value) => {

            this.modelHuman.material.metalness = value;

        });
        gui.add(params, 'powerHolo', 0.0, 1.0).step(0.01).onChange((value) => {
            console.log(this.holoScreen);
            this.holoScreen.uniforms.powerHolo.value = value;
        });
        gui.add(params, 'glitchHolo', 1.0, 10.0).step(0.01).onChange((value) => {
            this.holoScreen.uniforms.glitchHolo.value = value;
        });
        gui.add(params, 'progress', 0.0, 3.0).step(0.01).onChange((value) => {
            this.holoScreen.uniforms.progress.value = value;
        });
    }
    updateCallback() {
        this.renderer.clear();
        this.time += 0.005;
        if (this.modelHuman) {
            //this.modelHuman.rotation.y += this.time;
        }
        if (this.userData.shader) {
            this.userData.shader.uniforms.uTime.value = this.time;
            this.holoScreen.uniforms.uTime.value = this.time * 2.0;
            this.composer.render();
        }
    }
    loadAssets(callback) {
        new LoaderGLTF({
            src: document.getElementById("src-model-glb").dataset.src,
            resolve: (obj) => {
                console.log(obj);
                this.modelHuman = obj.scene.children[0];
                //this.modelHuman = obj;
                // this.modelHuman.traverse((node) => {
                //     if (node instanceof THREE.Mesh) {
                //         this.setMaterialMidwam(node);
                //         node.material.onBeforeCompile = this.beforeCompile.bind(this);
                //     }
                // })
                this.setMaterialMidwam(this.modelHuman);
                this.modelHuman.material.onBeforeCompile = this.beforeCompile.bind(this);

                this.mainScene.add(this.modelHuman);

                //////

                callback && callback();
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
            metalness: params.metalness,
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