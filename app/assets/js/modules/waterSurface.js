
import SceneWaterSurface from './../components/waterSurface/scene';

export default class WaterSurface {
    constructor(){
        this.$container = document.getElementById("cv-water-surface");
        this.scene = new SceneWaterSurface({
            $container : this.$container
        })
    }
}