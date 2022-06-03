
import SceneCrossfadeShader from './../components/crossfadeShader/scene';

export default class CrossfadeShader {
    constructor(){
        this.$container = document.getElementById("cv-crossfade-shader");
        this.scene = new SceneCrossfadeShader({
            $container : this.$container
        });
    }
}