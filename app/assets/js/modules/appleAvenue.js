
import SceneAppleAvenue from './../components/appleAvenue/scene';
import { Pane } from 'tweakpane';
import gsap, { Power1 } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TweenMax } from 'gsap/gsap-core';
import { LoadNewCubeMap } from './../ultilities/jsm/loaders/cubemap';
gsap.registerPlugin(ScrollTrigger);
export default class AppleAvenue {
    constructor() {
        this.$container = document.getElementById("cv-apple-avenue");
        this.path = document.getElementById("path-cube-env").dataset.path;
        this.pane = new Pane();
        this.elmWrapper = ".cube-decor__wrapper";
        this.options = {
            scale1: 0.135,
            scale2: 0.065,
            lenghtDisplacement: 5.,
            lengthMaximum: 2.2,
            zCameraPer: 4.5,
            zCameraOrtho: 4.5,
            speedRotate: 0.007,
            zPositionCube: 1.45,
            isRotate: true,
            opacityGlass : 4.5,
            envMap : true
        };
        this.bounce = {
            min : 0.0,
            max : 0.025,
            current : 0.0
        };
        
        this.gui();

        if (!window.bodyScrollBar) {
            window.bodyScrollBar = this.bodyScrollBar;
            window.ScrollTrigger = ScrollTrigger;
        }
        this.init();
        this.loadCubeMap();
        this.tweenBounce();
        this.initSmoothScroll();
        this.timeLineScrollTrigger();
        this.scene.transition = this.animate.bind(this);
    }
    loadCubeMap(){
        this.cubeMap = new LoadNewCubeMap({
            path : this.path,
            resolve : (cube) => {
                if(this.scene.cubeBorderMesh){
                    this.scene.cubeBorderMesh.material.uniforms.uEnvMap.value = cube;
                }
            }
        })
    }
    init(){
        this.scene = new SceneAppleAvenue({
            $container: this.$container,
            options: this.options,
            size: {
                width: 900,
                height: 900
            }
        });
    }
    tweenBounce(){
        const tweenBounce = TweenMax.to(this.bounce, 2,{ current : this.bounce.max, ease : Power1.easeInOut});
        tweenBounce.repeat(-1).yoyo(true);
    }
    animate() {
        if (this.scene.cubeMesh) {
            this.scene.cubeMesh.material.uniforms.lenghtDisplacement.value = this.options.lenghtDisplacement;
            this.scene.cubeMesh.material.uniforms.lengthMaximum.value = this.options.lengthMaximum;
            this.scene.cubeMesh.material.uniforms.uBounce.value = this.bounce.current;
            if(this.options.isRotate){
                this.scene.cubeMesh.rotation.x += this.options.speedRotate;
                this.scene.cubeMesh.rotation.y += this.options.speedRotate;
            }
        }
        if(this.scene.cubeBorderMesh){
            if(this.options.isRotate){
                this.scene.cubeBorderMesh.rotation.x += this.options.speedRotate;
                this.scene.cubeBorderMesh.rotation.y += this.options.speedRotate;
            }
            this.scene.cubeBorderMesh.material.uniforms.uOpacity.value = this.options.opacityGlass;
            this.scene.cubeBorderMesh.material.uniforms.isUseEnvMap.value = this.options.envMap;
        }
    }
    gui() {
        this.pane.addInput(this.options, "lenghtDisplacement", {
            min: 0.00,
            max: 5.
        });
        this.pane.addInput(this.options, "lengthMaximum", {
            min: 0.00,
            max: 10.
        });
        this.pane.addInput(this.options, "opacityGlass", {
            min: 0.0,
            max: 30.
        });
        this.pane.addInput(this.options, "isRotate");
        this.pane.addInput(this.options, "envMap");
    }
    initSmoothScroll() {
        document.querySelector('body').classList.add("smooth-scroll-wrapper-body");
        const scroller = document.querySelector('body');
        let bodyScrollBar = Scrollbar.init(scroller, { damping: 0.08, delegateTo: document, alwaysShowTracks: true });
        ScrollTrigger.scrollerProxy(scroller, {
            scrollTop(value) {
                if (arguments.length) {
                    bodyScrollBar.scrollTop = value;
                }
                return bodyScrollBar.scrollTop;
            }
        });
        bodyScrollBar.addListener(ScrollTrigger.update);
        ScrollTrigger.defaults({ scroller: scroller });
    }
    timeLineScrollTrigger() {
        let tl = gsap.timeline({
            scrollTrigger : {
                trigger : this.elmWrapper,
                start : "top top",
                endTrigger : ".js-end-trigger",
                pin : false,
                scrub : 1,
                markers : false
            }
        });
        tl.from(this.elmWrapper, { 
            x : '112%',
            y : '-12%',
        });
        tl.to(this.elmWrapper,{
            x : '-2%',
            y : '99%',
        });
    }
}