import * as THREE from 'three';
import SceneBlob2d from './../components/blobBubble2d/scene';
import BubbleCircleGeometry from '../components/blobBubble2d/bubbleCircleGeometry';


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
        this.bubble = new BubbleCircleGeometry({})
        this.testScene.mainScene.add(this.bubble.getMesh());
    }
    setUpdateCallback(){
        this.testScene.updateCallback = () => {
            this.bubble.update();
        }
    }
    update(){
        this.testScene.update();
    }
}