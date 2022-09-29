
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
            isRotate: false,
            opacityGlass : 30.0,
            envMap : false,
            positionLight : {
                x : 1.24,
                y : 1.24
            },
            lightPower : 5,
            caustics : [
                {
                    text : "Crystal",
                    value : 0
                },
                {
                    text : "Amoebas",
                    value : 1
                },
                {
                    text : "Soluble",
                    value : 2
                },
                {
                    text : "Turbo color map",
                    value : 3
                },
                {
                    text : "Blob Rainbow",
                    value : 4
                },
                {
                    text : "Tileable water",
                    value : 5
                }
            ],
            causticType : 0
        };
        this.optionsColorSideLogo = {
            "side1" : {
                color1 : "rgb(227, 31, 199)",
                color2 : "rgb(74, 173, 242)",
            },
            "side2" : {
                color1 : "rgb(227, 31, 199)",
                color2 : "rgb(255, 204, 51)",
            },
            "side3" : {
                color1 : "rgb(255, 204, 51)",
                color2 : "rgb(235, 51, 36)",
            },
            "side4" : {
                color1 : "rgb(255, 204, 51)",
                color2 : "rgb(235, 51, 36)",
            },
            "side5" : {
                color1 : "rgb(255, 255, 255)",
                color2 : "rgb(255, 255, 255)",
            },
            "side6" : {
                color1 : "rgb(227, 31, 199)",
                color2 : "rgb(255, 204, 51)",
            },
        };
        this.optionsColorGlassCube = {
            color1 : "rgb(255, 255, 255)",
            color2 : "rgb(255, 255, 255)",
            notUse : false
        };
        this.optionsColorBorder = {
            color1 : "rgb(255, 255, 255)",
            color2 : "rgb(255, 255, 255)",
            notUse : true
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
        /// make heavy load , crash device
        return;
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
            optionsColorSideLogo : this.optionsColorSideLogo,
            optionsColorGlassCube : this.optionsColorGlassCube,
            optionsColorBorder : this.optionsColorBorder,
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
            const uniformsCube = this.scene.cubeMesh.material.uniforms;
            uniformsCube.lenghtDisplacement.value = this.options.lenghtDisplacement;
            uniformsCube.lengthMaximum.value = this.options.lengthMaximum;
            uniformsCube.uBounce.value = this.bounce.current;
            if(this.options.isRotate){
                this.scene.cubeMesh.rotation.x += this.options.speedRotate;
                this.scene.cubeMesh.rotation.y += this.options.speedRotate;
            }
            this.guiColorLogoUpdate();
        }
        if(this.scene.cubeBorderMesh){
            const uniformsBorder = this.scene.cubeBorderMesh.material.uniforms;
            if(this.options.isRotate){
                this.scene.cubeBorderMesh.rotation.x += this.options.speedRotate;
                this.scene.cubeBorderMesh.rotation.y += this.options.speedRotate;
            }
            uniformsBorder.uOpacity.value = this.options.opacityGlass;
            uniformsBorder.isUseEnvMap.value = this.options.envMap;
            uniformsBorder.uPositionLight.value = this.options.positionLight;
            uniformsBorder.uLightPower.value = this.options.lightPower;
            this.guiColorGlassUpdate();
            this.guiColorBorderUpdate();
        }
    }
    guiColorGlassUpdate(){
        const color1 = this.scene.colorToVector(this.optionsColorGlassCube.color1);
        const color2 = this.scene.colorToVector(this.optionsColorGlassCube.color2);
        const material = this.scene.cubeBorderMesh.material;
        ///////////
        material.uniforms.colorGlass.value = [
            color1,
            color2
        ];
        material.uniforms.isNoUseModifyColors.value = this.optionsColorGlassCube.notUse;
    }
    guiColorBorderUpdate(){
        const color1 = this.scene.colorToVector(this.optionsColorBorder.color1);
        const color2 = this.scene.colorToVector(this.optionsColorBorder.color2);
        const material = this.scene.cubeBorderMesh.material;
        ///////////
        material.uniforms.colorBorder.value = [
            color1,
            color2
        ];
        material.uniforms.isNoUseModifyColorsBorder.value = this.optionsColorBorder.notUse;
    }
    guiColorLogoUpdate(){
        const obj = this.scene.getColorLogoSideCube();
        const material = this.scene.cubeMesh.material;
        ////////////
        material.uniforms.colorSide1.value = [
            obj.side1.color1,
            obj.side1.color2
        ]
        ////////////
        material.uniforms.colorSide2.value = [
            obj.side2.color1,
            obj.side2.color2
        ]
        ////////////
        material.uniforms.colorSide3.value = [
            obj.side3.color1,
            obj.side3.color2
        ]
        ////////////
        material.uniforms.colorSide4.value = [
            obj.side4.color1,
            obj.side4.color2
        ]
        ////////////
        material.uniforms.colorSide5.value = [
            obj.side5.color1,
            obj.side5.color2
        ]
        ////////////
        material.uniforms.colorSide6.value = [
            obj.side6.color1,
            obj.side6.color2
        ]
        ////////////
    }
    gui() {
        this.pane.addInput(this.options, "lengthMaximum", {
            min: 0.00,
            max: 10.
        });
        this.pane.addInput(this.options, "opacityGlass", {
            min: 0.0,
            max: 30.
        });
        this.pane.addBlade({
            view : 'list',
            label : 'Caustic',
            options : this.options.caustics,
            value : this.options.causticType
        })
        this.pane.addInput(this.options, "isRotate");
        this.pane.addInput(this.options, "envMap");
        ////////////////
        this.pane.addInput(this.options.positionLight, "x", {
            min : 0.0,
            max : 1.5
        });
        ///////////////
        this.pane.addInput(this.options.positionLight, "y", {
            min : 0.0,
            max : 1.5
        });
        ///////////////
        this.pane.addInput(this.options, "lightPower", {
            min : 0.0,
            max : 10
        });
        ///////////////
        this.paneOnChange();
        this.paneFolderColorBorder();
        this.paneFolderColorGlass();
        this.paneFolderColorLogo();
        ///////////////
    }
    paneFolderColorBorder(){
        this.folderColorBorder = this.pane.addFolder({
            title : 'Color border cube',
            expanded : true
        });
        this.folderColorBorder.addInput(
            this.optionsColorBorder,
            'color1'
        );
        this.folderColorBorder.addInput(
            this.optionsColorBorder,
            'color2'
        );
        this.folderColorBorder.addInput(
            this.optionsColorBorder,
            'notUse'
        );
    }
    paneFolderColorGlass(){
        this.folderColorGlass = this.pane.addFolder({
            title : 'Color glass cube',
            expanded : true
        });
        this.folderColorGlass.addInput(
            this.optionsColorGlassCube,
            'color1'
        );
        this.folderColorGlass.addInput(
            this.optionsColorGlassCube,
            'color2'
        );
        this.folderColorGlass.addInput(
            this.optionsColorGlassCube,
            'notUse'
        );
    }
    paneFolderColorLogo(){
        this.folderColors1 = this.pane.addFolder({
            title : 'Logo color face 1',
            expanded: false,
        });
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side1,
            'color1'
        );
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side1,
            'color2'
        );
        ///////////////////////
        this.folderColors1 = this.pane.addFolder({
            title : 'Logo color face 2',
            expanded: false,
        });
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side2,
            'color1'
        );
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side2,
            'color2'
        );
        ///////////////////////
        this.folderColors1 = this.pane.addFolder({
            title : 'Logo color face 3',
            expanded: false,
        });
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side3,
            'color1'
        );
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side3,
            'color2'
        );
        ///////////////////////
        this.folderColors1 = this.pane.addFolder({
            title : 'Logo color face 4',
            expanded: false,
        });
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side4,
            'color1'
        );
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side4,
            'color2'
        );
        ///////////////////////
        this.folderColors1 = this.pane.addFolder({
            title : 'Logo color face 5',
            expanded: true,
        });
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side5,
            'color1'
        );
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side5,
            'color2'
        );
        ///////////////////////
        this.folderColors1 = this.pane.addFolder({
            title : 'Logo color face 6',
            expanded: false,
        });
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side6,
            'color1'
        );
        this.folderColors1.addInput(
            this.optionsColorSideLogo.side6,
            'color2'
        );
    }
    paneOnChange(){
        this.pane.on('change', (ev) => {
            if (ev.target.label === "Caustic") {
                this.options.causticType = ev.value;
                this.scene.cubeBorderMesh.material.uniforms.uCausticType.value = ev.value;
            }
        });
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