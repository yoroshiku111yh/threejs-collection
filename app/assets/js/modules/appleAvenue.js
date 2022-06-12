
import SceneAppleAvenue from './../components/appleAvenue/scene';

export default class AppleAvenue {
    constructor(){
        this.$container = document.getElementById("cv-apple-avenue");
        this.scene = new SceneAppleAvenue({$container : this.$container});
    }
}