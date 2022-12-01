
import SceneLoadModel from './../components/loadModel/scene';

export default class LoadModel{
    constructor(){
        this.init();
    }
    init(){
        this.mainScene = new SceneLoadModel({
            $container : document.getElementById("cv-load-model"),
            $size : {
                width : window.innerWidth,
                height : window.innerHeight
            }
        })
    }
}