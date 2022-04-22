
import { Expo } from 'gsap';
import SceneDistortion from './../components/distortionImage/scene';
import MeshComponent from './../components/distortionImage/texture';

export default class DistortionImage{
    constructor(){
        this.scenes = [];
        this.dataObj = [];
        this.$parent = document.querySelectorAll('.js-distortion-img-wrapper');
        this.init();
    }
    init(){
        this.createSceneListItem();
        this.update();
    }
    createSceneListItem(){
        for(let i = 0 ; i < this.$parent.length ; i++){
            const el = this.$parent[i];
            const imgs = el.querySelectorAll('.js-distortion-img');
            const $container = document.getElementById(`cv-distortion-img-${i + 1}`);
            const obj = {
                parent : el,
                width : el.clientWidth,
                height : el.clientHeight,
                imagesRatio : el.dataset.ratio || 1.0,
                intensity : el.dataset.intensity || 1,
                speedIn: el.dataset.speedin || 1.6,
                speedOut: el.dataset.speedout || 1.2,
                easing: el.dataset.easing || Expo.easeOut,
                hover : el.dataset.hover || true,
                image1 : imgs[0].getAttribute('src'),
                image2 : imgs[1].getAttribute('src'),
                displacementImage : el.dataset.displacement,
                commonAngle : el.dataset.angle || Math.PI/4, //default 45 deg
                angle1 : el.dataset.angle1 || Math.PI/4,
                angle2 : el.dataset.angle2 || (-Math.PI/4)*3,
                video : el.dataset.video || false
            }
            const scene = new SceneDistortion({ 
                $container : $container, 
                size : {
                    width : obj.width,
                    height : obj.height
                },
            });
            const mesh = new MeshComponent(obj);
            scene.mainScene.add(mesh.createMesh());
            mesh.transitionIn();
            this.scenes.push(scene);
            this.dataObj.push(obj);
        }
    }
    update(){
        for(let i = 0; i< this.scenes.length; i++){
            this.scenes[i].update();
        }
    }
}