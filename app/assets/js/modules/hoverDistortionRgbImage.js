
import SceneHoverDistortionImage from './../components/hoverDistortionSplitRgbImage/scene';

export default class HoverDistortionRgbImage {
    constructor(){
        this.init();
    }
    init(){
        this.initScene();
    }
    initScene(){
        this.sceneImage = new SceneHoverDistortionImage({
            $container : document.getElementById("cv-hover-distortion"),
            size : {
                width : window.innerWidth,
                height : window.innerHeight
            }
        })
    }
}