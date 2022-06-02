
import SceneMagicMorphCube from './../components/magicMorphCube/scene';

const texSrc1 = "https://i.imgur.com/jbCWdRR.jpg";
const texSrc2 = "https://i.imgur.com/QNliu8O.jpg";

export default class MagicMorphingCube {
    constructor(){
        this.$container = document.getElementById("cv-morph-cube");
        this.scene = new SceneMagicMorphCube({
            $container : this.$container,
            size : {},
            texSrc1 : texSrc1,
            texSrc2 : texSrc2
        })
    }
}