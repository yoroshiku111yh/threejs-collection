
import SceneAppleAvenue from './../components/appleAvenue/scene';
import { Pane } from 'tweakpane';

export default class AppleAvenue {
    constructor(){
        this.$container = document.getElementById("cv-apple-avenue");
        this.pane = new Pane();
        this.options = {
            scale1 : 0.135,
            scale2 : 0.065,
            lenghtDisplacement : 5.,
            lengthMaximum : 2.2,
            zCameraPer : 4.5,
            zCameraOrtho : 4.5,
            speedRotate : 0.007,
            zPositionCube : 1.45,
            isRotate : true
        };
        this.scene = new SceneAppleAvenue({
            $container : this.$container,
            options : this.options,
            size : {
                width : 900,
                height : 900
            }
        });
        this.scene.transition = this.animate.bind(this);
        this.gui();
    }
    animate(){
        if(this.scene.cubeMesh){
            this.scene.cubeMesh.material.uniforms.lenghtDisplacement.value = this.options.lenghtDisplacement;
            this.scene.cubeMesh.material.uniforms.lengthMaximum.value = this.options.lengthMaximum;
        }
        this.scene.isRotate = this.options.isRotate;
    }
    gui(){
        this.pane.addInput(this.options, "lenghtDisplacement", {
            min: 0.00,
            max: 5.
        });
        this.pane.addInput(this.options, "lengthMaximum", {
            min: 0.00,
            max: 10.
        });
        this.pane.addInput(this.options, "isRotate");
    }
}