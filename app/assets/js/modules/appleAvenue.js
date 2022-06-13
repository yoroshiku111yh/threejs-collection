
import SceneAppleAvenue from './../components/appleAvenue/scene';
import { Pane } from 'tweakpane';

export default class AppleAvenue {
    constructor(){
        this.$container = document.getElementById("cv-apple-avenue");
        this.pane = new Pane();
        this.options = {
            scale1 : 0.7,
            scale2 : 0.25,
            lenghtDisplacement : 0.
        };
        this.scene = new SceneAppleAvenue({
            $container : this.$container,
            options : this.options
        });
        this.scene.transition = this.animate.bind(this);
        this.gui();
    }
    animate(){
        this.scene.cubeMesh.material.uniforms.lenghtDisplacement.value = this.options.lenghtDisplacement;
    }
    gui(){
        this.pane.addInput(this.options, "lenghtDisplacement", {
            min: 0.0,
            max: 1.0
        });
    }
}