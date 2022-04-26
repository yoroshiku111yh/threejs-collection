import * as THREE from 'three';
import SceneBlob2d from './../components/blobBubble2d/scene';
import BubbleCircleGeometry from '../components/blobBubble2d/bubbleCircleGeometry';
import BubbleShader from '../components/blobBubble2d/bubbleShader';

export default class BlobBubble2d {
    constructor(){
        this.processingVal = 1;
        this.spikesVal = 0.5;
        this.speedVal = 15;
        this.init();
        this.setUpdateCallback();
        this.update();
    }
    init(){
        this.testScene = new SceneBlob2d({
            $container : document.getElementById("blob-bubble-cv"),
            size : {
                width : window.innerWidth,
                height : window.innerHeight
            }
        });
        this.testScene.mainScene.background = new THREE.Color("#ccc");
        // basic
        this.bubble = new BubbleCircleGeometry({})
        this.testScene.mainScene.add(this.bubble.getMesh());
        // shader
        this.bubbleShader = new BubbleShader({});
        this.testScene.mainScene.add(this.bubbleShader.getMesh());
    }
    setUpdateCallback(){
        this.testScene.updateCallback = () => {
            this.bubble.update();
            this.bubbleShader.update();
        }
    }
    update(){
        this.testScene.update();
    }
}