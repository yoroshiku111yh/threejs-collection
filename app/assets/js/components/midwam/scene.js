/// tutorial and code research from Yuri Artiukh
import { clearColorDark } from './../../ultilities/variable';
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';
import { LoaderGLTF } from './../../ultilities/object3dLoader/gltf';

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
        this.renderer.setClearColor(new THREE.Color(clearColorDark));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        this.initCamera();
        this.light();
        this.makePmremGenerator();
        this.texture = await this.loadTex.loadAsync(this.srcEnv);
        this.envMap = this.pmremGenerator.fromEquirectangular(this.texture).texture;
        //this.envMap.mapping = THREE.EquirectangularReflectionMapping;
        this.pmremGenerator.dispose();
        this.loadAssets();
        this.update();
    }
    updateCallback() {
        this.renderer.clear();
        this.time += 0.005;
        if (this.modelHuman) {
            //this.modelHuman.rotation.z = this.time;
        }
        if(this.userData.shader){
            this.userData.shader.uniforms.uTime.value = this.time;
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
                this.modelHuman = obj.scene.children[0];
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
        })
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

                        reflectVec = rotate(reflectVec, vec3(1.0, 0.0, 0.0), uTime*2.0);

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
        node.material = new THREE.MeshPhysicalMaterial({
            metalness: 1,
            roughness: 0.28,
            envMap: this.envMap
        });
        this.userData.material = node.material;
    }
    makePmremGenerator() {
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();
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