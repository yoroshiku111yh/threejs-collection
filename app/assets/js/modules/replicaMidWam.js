import SceneMidWam from "../components/midwam/scene";


export default class ReplicaMidWam{
    constructor(){
        this.init();
    }
    init(){
        this.mainScene = new SceneMidWam({
            $container : document.getElementById("cv-midwam"),
            $size : {
                width : window.innerWidth,
                height : window.innerHeight
            }
        })
    }
}