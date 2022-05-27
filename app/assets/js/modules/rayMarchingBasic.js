import SceneRaymarchingBasic from "../components/rayMarchingBasic/scene";


export default class RayMarchingBasic { 
    constructor(){
        this.$container = document.getElementById("cv-ray-marching");
        this.scene = new SceneRaymarchingBasic({$container : this.$container});
    }
}