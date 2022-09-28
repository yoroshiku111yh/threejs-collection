
import SceneParticlesTravelling from '../components/particlesTravelling/scene';

export default class ParticlesTravelling {
    constructor(){
        this.elmSvgMap = document.querySelector("#svg-map-1");
        this.bgMapElm = document.querySelector("#bg-map");
        console.log(this.bgMapElm);
        this.scene = new SceneParticlesTravelling({
            $container : document.querySelector("#cv-travel-particles"),
            svgPaths : this.getSvgPath(this.elmSvgMap),
            size : {
                height : 1000
            },
            svgSize : {
                width : this.elmSvgMap.getAttribute("width"),
                height : this.elmSvgMap.getAttribute("height")
            },
            options : {
                bright : 7,
                speed : Math.round(1.0), // 0.5 , 1.0
                cameraZ : 850
            },
            bgMap : {
                src : this.bgMapElm.src,
                size : {
                    width : this.bgMapElm.dataset.width,
                    height : this.bgMapElm.dataset.height
                }
            }
        });
    }
    getSvgPath(svg){
        return [...svg.querySelectorAll('.cls-1')];
    }
}