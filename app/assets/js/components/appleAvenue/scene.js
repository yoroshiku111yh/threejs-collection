
import SceneBase from './../../ultilities/sceneBase';
import * as THREE from 'three';
import ShaderAppleAvenue from './../../../shaders/appleAvenue/index';
import { getResolutionVec3 } from './../../ultilities/resolution';
import ShaderAppleAvenueBorder from './../../../shaders/appleAvenue/border/index';


export default class SceneAppleAvenue extends SceneBase {
    constructor({
        $container,
        size = {},
        options = {},
        transition = null,
        cubeMap = null,
        optionsColorSideLogo = null,
        optionsColorGlassCube = null,
        optionsColorBorder = null
    }) {
        super($container, size.width, size.height, true);
        this.options = options;
        this.optionsColorSideLogo = optionsColorSideLogo;
        this.optionsColorGlassCube = optionsColorGlassCube;
        this.optionsColorBorder = optionsColorBorder;
        this.transition = transition;
        this.resolution = getResolutionVec3({ W: this.W, H: this.H });
        this.maskLogoSrc = document.getElementById("maskLogo").dataset.src;
        this.maskLogoTextSrc = document.getElementById("maskLogoText").dataset.src;
        this.mapBumpSrc = document.getElementById("map-bump-env").dataset.src;
        this.loader = new THREE.TextureLoader();
        this.groupCube = new THREE.Group();
        this.cubeMap = cubeMap;
        this.init();
    }
    init() {
        this.start();
        this.renderer.autoClear = false;
        //this.renderer.setClearColor(clearColorDark);
        this.initPerspectiveCamera();
        this.initOrthographicCamera();
        this.camera.position.z = this.options.zCameraPer;
        this.orthoCamera.position.z = this.options.zCameraOrtho;
        this.zPositionCube = this.options.zPositionCube;
        this.isRotate = this.options.isRotate;
        this.mainScene.add(this.groupCube);
        this.causticType = this.options.causticType;
        this.createFbo();
        this.createLogoPlane();
        this.createLogoTextPlane();
        this.createCubeBorder();
        this.createCube();
        this.update();

        //this.resize();
    }
    initOrthographicCamera() {
        this.orthoCamera = new THREE.OrthographicCamera(
            this.W / -2,
            this.W / 2,
            this.H / 2,
            this.H / -2,
            1,
            1000
        );
        this.orthoCamera.layers.set(1);
        this.mainScene.add(this.orthoCamera);
    }
    createFbo() {
        this.envFbo = new THREE.WebGLRenderTarget(
            this.W * this.resolution.z,
            this.H * this.resolution.z
        )
        this.sceneTarget = new THREE.Scene();
        this.envFbo2 = new THREE.WebGLRenderTarget(
            this.W * this.resolution.z,
            this.H * this.resolution.z
        )
        this.sceneTarget2 = new THREE.Scene();
    }
    createLogoPlane() {
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({
            map: this.loader.load(this.maskLogoSrc)
        });
        this.planeLogo = new THREE.Mesh(geo, mat);
        this.planeLogo.layers.set(1);
        const scale = this.options.scale1 || 1;
        this.planeLogo.scale.set(1071 * scale, 1830 * scale);
        ///
        this.planeLogo.position.x = this.groupCube.position.x;
        this.planeLogo.position.y = this.groupCube.position.y;
        ///
        ///
        this.sceneTarget.add(this.planeLogo);
    }
    createLogoTextPlane() {
        const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({
            map: this.loader.load(this.maskLogoTextSrc)
        });
        this.planeLogoText = new THREE.Mesh(geo, mat);
        this.planeLogoText.layers.set(1);
        const scale = this.options.scale2 || 1;
        this.planeLogoText.scale.set(5682 * scale, 1830 * scale);
        ///
        this.planeLogoText.position.x = this.groupCube.position.x;
        this.planeLogoText.position.y = this.groupCube.position.y;
        ///
        this.sceneTarget2.add(this.planeLogoText);
    }
    updateCallback() {
        if (this.cubeMesh) {
            this.cubeMesh.material.uniforms.uTick.value += 0.001;
        }
        if (this.cubeBorderMesh) {
            this.cubeBorderMesh.material.uniforms.uTick.value += 0.001;
        }

        this.renderer.clear();
        this.renderer.setRenderTarget(this.envFbo);
        this.renderer.render(this.sceneTarget, this.orthoCamera);

        this.renderer.setRenderTarget(null);

        this.renderer.setRenderTarget(this.envFbo2);
        this.renderer.render(this.sceneTarget2, this.orthoCamera);

        this.renderer.setRenderTarget(null);


        this.renderer.clearDepth();

        if (this.transition) {
            this.transition();
        }

    }
    getColorLogoSideCube() {
        if (!this.optionsColorSideLogo) return false;
        const objColor = {};
        const { side1, side2, side3, side4, side5, side6 } = this.optionsColorSideLogo;
        objColor.side1 = {};
        objColor.side1.color1 = this.colorToVector(side1.color1);
        objColor.side1.color2 = this.colorToVector(side1.color2);
        ////
        objColor.side2 = {};
        objColor.side2.color1 = this.colorToVector(side2.color1);
        objColor.side2.color2 = this.colorToVector(side2.color2);
        ////
        objColor.side3 = {};
        objColor.side3.color1 = this.colorToVector(side3.color1);
        objColor.side3.color2 = this.colorToVector(side3.color2);
        ////
        objColor.side4 = {};
        objColor.side4.color1 = this.colorToVector(side4.color1);
        objColor.side4.color2 = this.colorToVector(side4.color2);
        ////
        objColor.side5 = {};
        objColor.side5.color1 = this.colorToVector(side5.color1);
        objColor.side5.color2 = this.colorToVector(side5.color2);
        ////
        objColor.side6 = {};
        objColor.side6.color1 = this.colorToVector(side6.color1);
        objColor.side6.color2 = this.colorToVector(side6.color2);
        return objColor;
    }
    createCube() {
        const geo = new THREE.BoxGeometry(1, 1, 1, 1);

        geo.setAttribute('sides', new THREE.Float32BufferAttribute(this.createArraySidesCube(), 1));

        const colorSides = this.getColorLogoSideCube();
        this.mat = new ShaderAppleAvenue({
            uPos: {
                value: this.groupCube.position
            },
            uType: {
                value: 1
            },
            uBounce: {
                value: 0.0
            },
            uResolution: {
                value: {
                    x: this.resolution.x * this.resolution.z,
                    y: this.resolution.y * this.resolution.z,
                    z: this.resolution.z
                }
            },
            uTick: {
                value: 0.0
            },
            uMask1: {
                value: this.envFbo.texture
            },
            uMask2: {
                value: this.envFbo2.texture
            },
            isRefract: {
                value: false
            },
            lenghtDisplacement: {
                value: this.options.lenghtDisplacement !== null ? this.options.lenghtDisplacement : 0.0
            },
            zPosition: {
                value: 1.0
            },
            lengthMaximum: {
                value: this.options.lengthMaximum !== null ? this.options.lengthMaximum : 2.2
            },
            colorSide1: {
                value: [
                    colorSides.side1.color1,
                    colorSides.side1.color2,
                ]
            },
            colorSide2: {
                value: [
                    colorSides.side2.color1,
                    colorSides.side2.color2,
                ]
            },
            colorSide3: {
                value: [
                    colorSides.side3.color1,
                    colorSides.side3.color2,
                ]
            },
            colorSide4: {
                value: [
                    colorSides.side4.color1,
                    colorSides.side4.color2,
                ]
            },
            colorSide5: {
                value: [
                    colorSides.side5.color1,
                    colorSides.side5.color2,
                ]
            },
            colorSide6: {
                value: [
                    colorSides.side6.color1,
                    colorSides.side6.color2,
                ]
            }
        });
        this.cubeMesh = new THREE.Mesh(geo, this.mat);
        this.cubeMesh.position.z = this.zPositionCube - 0.05;
        this.groupCube.add(this.cubeMesh);
    }
    createCubeBorder() {

        const geo = new THREE.BoxGeometry(1, 1, 1, 1);

        this.mat = new ShaderAppleAvenueBorder({
            uPos: {
                value: this.groupCube.position
            },
            uResolution: {
                value: {
                    x: this.resolution.x * this.resolution.z,
                    y: this.resolution.y * this.resolution.z,
                    z: this.resolution.z
                }
            },
            isUseEnvMap: {
                value: true
            },
            uCausticType: {
                value: this.causticType
            },
            uOpacity: {
                value: this.options.opacityGlass
            },
            uTick: {
                value: 0.0
            },
            zPosition: {
                value: 1.0
            },
            uEnvMap: {
                value: this.cubeMap
            },
            uMapTexture: {
                value: this.loader.load(this.mapBumpSrc)
            },
            uPositionLight: {
                value: new THREE.Vector2(this.options.positionLight.x, this.options.positionLight.y)
            },
            uLightPower: {
                value: this.options.lightPower
            },
            colorGlass: {
                value: [
                    new THREE.Color(this.optionsColorGlassCube.color1),
                    new THREE.Color(this.optionsColorGlassCube.color2)
                ]
            },
            colorBorder : {
                value : [
                    new THREE.Color(this.optionsColorBorder.color1),
                    new THREE.Color(this.optionsColorBorder.color2)
                ]
            },
            isNoUseModifyColors: {
                value: this.optionsColorGlassCube.notUse
            },
            isNoUseModifyColorsBorder: {
                value: this.optionsColorBorder.notUse
            }
        });
        this.cubeBorderMesh = new THREE.Mesh(geo, this.mat);
        this.cubeBorderMesh.position.z = this.zPositionCube;
        this.groupCube.add(this.cubeBorderMesh);
    };
    colorToVector(color) {
        return new THREE.Color(color);
    }
    createArraySidesCube() {
        const side1 = [0, 0, 0, 0];
        const side2 = [1, 1, 1, 1];
        const side3 = [2, 2, 2, 2];
        const side4 = [3, 3, 3, 3];
        const side5 = [4, 4, 4, 4];
        const side6 = [5, 5, 5, 5];

        let boxSides = [...side1, ...side2, ...side3, ...side4, ...side5, ...side6];
        return boxSides;
    }
    resize() {
        window.addEventListener("resize", () => {
            this.W = window.innerWidth;
            this.H = window.innerHeight;
            this.resolution = getResolutionVec3({ W: this.W, H: this.H });
            this.renderer.setSize(this.W, this.H);
            this.camera.aspect = this.W / this.H;
            this.camera.updateProjectionMatrix();

            this.orthoCamera.left = this.W / -2;
            this.orthoCamera.right = this.W / 2;
            this.orthoCamera.top = this.H / 2;
            this.orthoCamera.bottom = this.H / -2;
            this.orthoCamera.updateProjectionMatrix();

            this.cubeMesh.material.uniforms.uResolution.value = {
                x: this.resolution.x * this.resolution.z,
                y: this.resolution.y * this.resolution.z,
                z: this.resolution.z
            }

            this.cubeBorderMesh.material.uniforms.uResolution.value = {
                x: this.resolution.x * this.resolution.z,
                y: this.resolution.y * this.resolution.z,
                z: this.resolution.z
            }

            this.envFbo.setSize(
                this.W * this.resolution.z,
                this.H * this.resolution.z
            );

            this.envFbo2.setSize(
                this.W * this.resolution.z,
                this.H * this.resolution.z
            );
        })
    }
}