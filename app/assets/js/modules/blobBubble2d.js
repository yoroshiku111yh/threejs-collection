import * as THREE from 'three';
import SceneBlob2d from './../components/blobBubble2d/scene';
import BubbleShader from '../components/blobBubble2d/bubbleShader';
import { getRandomValueInArray, randomInRange2 } from './../ultilities/ulti';

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
    }
    init() {
        this.testScene = new SceneBlob2d({
            $container: document.getElementById("blob-bubble-cv"),
            size: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
        this.testScene.mainScene.background = new THREE.Color("#ccc");
        // shader
        const fnX = randomInRange2(0.02, 0.05, false);
        const fnY = randomInRange2(0.02, 0.05, false);
        this.bubbleShader = new BubbleShader({
            planeSize: {
                width: 3,
                height: 3,
            },
            objUniforms : {
                radius : 0.5,
                spikes : 1.5,
                alpha : 0.25
            },
            moveTexture : {
                randomXFn : fnX,   
                randomYFn : fnY,
                direction : {
                    x : 1,
                    y : 1
                }
            }
        });
        this.testScene.mainScene.add(this.bubbleShader.getMesh());

        this.bubbleShader2 = new BubbleShader({
            planeSize: {
                width: 3,
                height: 3,
            },
            objUniforms : {
                radius : 0.45,
                spikes : 1.5,
                alpha : 0.75
            },
            moveTexture : {
                randomXFn : fnX,   
                randomYFn : fnY,
                direction : {
                    x : 1,
                    y : 1
                }
            }
        });
        this.testScene.mainScene.add(this.bubbleShader2.getMesh());

        this.bubbleShader3 = new BubbleShader({
            planeSize: {
                width: 3,
                height: 3,
            },
            objUniforms : {
                radius : 0.43,
                spikes : 1.5,
                alpha : 1.0
            },
            moveTexture : {
                randomXFn : fnX,   
                randomYFn : fnY,
                direction : {
                    x : 1,
                    y : 1
                }
            }
        });
        this.testScene.mainScene.add(this.bubbleShader3.getMesh());
    }
    setUpdateCallback() {
        this.testScene.updateCallback = () => {
            this.bubbleShader.update();
            this.bubbleShader2.update();
            this.bubbleShader3.update();
            ///
            const directionX = getRandomValueInArray([1, -1, -1, 1]);
            const directionY = getRandomValueInArray([1, -1, -1, 1]);
        
            this.bubbleShader.setDirection(
                directionX,
                directionY
            );
            this.bubbleShader2.setDirection(
                directionX,
                directionY
            );
            this.bubbleShader3.setDirection(
                directionX,
                directionY
            );
        }
    }
    update() {
        this.testScene.update();
    }
}