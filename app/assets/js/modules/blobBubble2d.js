import * as THREE from 'three';
import SceneBlob2d from './../components/blobBubble2d/scene';
import { getRandomValueInArray, randomInRange2 } from './../ultilities/ulti';
import BubbleIntro from './../components/blobBubble2d/bubbleIntro';

export default class BlobBubble2d {
    constructor() {
        this.clock = new THREE.Clock();
        this.clockDelta = this.clock.getDelta();
        this.processingVal = 1;
        this.spikesVal = 0.5;
        this.speedVal = 15;
        this.hoverTexture = null;
        this.changingTexture = false;
        this.init();
        this.setUpdateCallback();
        this.update();
        this.resize();
        this.animateIntro();
        //
        this.eventHoverGetTexture();
    }
    init() {
        this.testScene = new SceneBlob2d({
            $container: document.getElementById("blob-bubble-cv"),
            size: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
        this.testScene.mainScene.background = new THREE.Color("#fff");
        // shader
        const fnX = randomInRange2(0.02, 0.05, false);
        const fnY = randomInRange2(0.02, 0.05, false);
        this.bubbleIntro = new BubbleIntro({
            planeSize: {
                width: 3,
                height: 3,
            },
            objUniforms: {
                radius: 0.12,//0.5,
                spikes: 1.5,
                alpha: 0.25
            },
            moveTexture: {
                randomXFn: fnX,
                randomYFn: fnY,
                direction: {
                    x: 1,
                    y: 1
                }
            }
        });
        this.testScene.mainScene.add(this.bubbleIntro.getMesh());

        this.bubbleIntro2 = new BubbleIntro({
            planeSize: {
                width: 3,
                height: 3,
            },
            objUniforms: {
                radius: 0.1,//0.45,
                spikes: 1.5,
                alpha: 0.75
            },
            moveTexture: {
                randomXFn: fnX,
                randomYFn: fnY,
                direction: {
                    x: 1,
                    y: 1
                }
            }
        });
        this.testScene.mainScene.add(this.bubbleIntro2.getMesh());

        this.bubbleIntro3 = new BubbleIntro({
            planeSize: {
                width: 3,
                height: 3,
            },
            objUniforms: {
                radius: 0.08,//0.43,
                spikes: 1.5,
                alpha: 1.0
            },
            moveTexture: {
                randomXFn: fnX,
                randomYFn: fnY,
                direction: {
                    x: 1,
                    y: 1
                }
            }
        });
        this.testScene.mainScene.add(this.bubbleIntro3.getMesh());
    }
    setUpdateCallback() {
        this.testScene.updateCallback = () => {
            this.bubbleIntro.update();
            this.bubbleIntro2.update();
            this.bubbleIntro3.update();
            ///
            const directionX = getRandomValueInArray([1, -1, -1, 1]);
            const directionY = getRandomValueInArray([-1, 1, -1, -1]);

            this.bubbleIntro.setDirection(
                directionX,
                directionY
            );
            this.bubbleIntro2.setDirection(
                directionX,
                directionY
            );
            this.bubbleIntro3.setDirection(
                directionX,
                directionY
            );
        }
    }
    update() {
        this.testScene.update();
    }
    resize(){
        window.addEventListener("resize", () => {
            this.testScene.resize({
                width : window.innerWidth,
                height : window.innerHeight
            })
        })
    }
    animateIntro() {
        setTimeout(() => {
            this.bubbleIntro.animationIntro({  radius: 0.5,  duration: 0.75 });
            this.bubbleIntro2.animationIntro({ radius: 0.45, duration: 0.95 });
            this.bubbleIntro3.animationIntro({ radius: 0.43, duration: 1.05 });
        }, 1000);
    }
    eventHoverGetTexture(){
        $('.js-hover-bubble-texture').on("mouseenter", (e) => {
            const _this = e.currentTarget;
            this.hoverTexture = new THREE.TextureLoader().load(_this.dataset.src);
            if(this.changingTexture) return;
            this.changingTexture = true;
            this.bubbleIntro.setDisFactor();
            this.bubbleIntro.updateTexture(null, this.hoverTexture);
            this.bubbleIntro.transitionIn(() => {
                this.bubbleIntro.updateTexture(this.hoverTexture, null);
                this.changingTexture = false;
            });
            //
            this.bubbleIntro2.setDisFactor();
            this.bubbleIntro2.updateTexture(null, this.hoverTexture);
            this.bubbleIntro2.transitionIn(() => {
                this.bubbleIntro2.updateTexture(this.hoverTexture, null);
                this.changingTexture = false;
            });
            //
            this.bubbleIntro3.setDisFactor();
            this.bubbleIntro3.updateTexture(null, this.hoverTexture);
            this.bubbleIntro3.transitionIn(() => {
                this.bubbleIntro3.updateTexture(this.hoverTexture, null);
                this.changingTexture = false;
            });
        })
        $('.js-hover-bubble-texture').on("mouseleave", (e) => {
            this.hoverTexture = null;
        })
    }
}