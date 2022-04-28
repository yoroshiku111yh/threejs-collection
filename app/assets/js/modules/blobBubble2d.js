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
        this.init();
        this.setUpdateCallback();
        this.update();
        this.animateIntro();
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
        this.BubbleIntro = new BubbleIntro({
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
        this.testScene.mainScene.add(this.BubbleIntro.getMesh());

        this.BubbleIntro2 = new BubbleIntro({
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
        this.testScene.mainScene.add(this.BubbleIntro2.getMesh());

        this.BubbleIntro3 = new BubbleIntro({
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
        this.testScene.mainScene.add(this.BubbleIntro3.getMesh());
    }
    setUpdateCallback() {
        this.testScene.updateCallback = () => {
            this.BubbleIntro.update();
            this.BubbleIntro2.update();
            this.BubbleIntro3.update();
            ///
            const directionX = getRandomValueInArray([1, -1, -1, 1]);
            const directionY = getRandomValueInArray([-1, 1, -1, -1]);

            this.BubbleIntro.setDirection(
                directionX,
                directionY
            );
            this.BubbleIntro2.setDirection(
                directionX,
                directionY
            );
            this.BubbleIntro3.setDirection(
                directionX,
                directionY
            );
        }
    }
    update() {
        this.testScene.update();
    }
    animateIntro() {
        setTimeout(() => {
            this.BubbleIntro.animationIntro({  radius: 0.5,  duration: 0.75 });
            this.BubbleIntro2.animationIntro({ radius: 0.45, duration: 0.95 });
            this.BubbleIntro3.animationIntro({ radius: 0.43, duration: 1.05 });
        }, 1000);
    }
}