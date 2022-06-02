
import SceneHoverDistortionImage from './../components/hoverDistortionSplitRgbImage/scene';

export default class HoverDistortionRgbImage {
    constructor(){
        this.init();
    }
    init(){
        this.initScene();
        this.eventHoverIn();
        this.eventHoverOut();
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
    eventHoverIn(){
        $('.js-hover').on("mouseover", (e) => {
            const _this = e.currentTarget;
            const url = _this.dataset.img;
            const sizeMesh = JSON.parse(_this.dataset.size);
            this.sceneImage.onMouseHover({
                url : url,
                size : sizeMesh
            });
        })
    }
    eventHoverOut(){
        $('.js-hover').on("mouseout", (e) => {
            this.sceneImage.onMouseOut();
        })
    }
}