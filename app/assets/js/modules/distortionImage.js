
import { Expo } from 'gsap';
import { getTextureByName, loadAllTextures } from '../ultilities/ulti';
import SceneDistortion from './../components/distortionImage/scene';
import MeshComponent from './../components/distortionImage/texture';

export default class DistortionImage {
    constructor() {
        this.scenes = [];
        this.meshes = [];
        this.dataObj = [];
        this.$parent = document.querySelectorAll('.js-distortion-img-wrapper');
        this.init();
    }
    init() {
        this.createSceneListItem();
        this.eventClickNextSlide();
        this.eventClickPrevSlide();
    }
    createSceneListItem() {
        for (let i = 0; i < this.$parent.length; i++) {
            const el = this.$parent[i];
            const imgs = el.querySelectorAll('.js-distortion-img');
            const $container = document.getElementById(`cv-distortion-img-${i + 1}`);
            const arImages = [];
            for (let j = 0; j < imgs.length; j++) {
                arImages.push({
                    src: imgs[j].getAttribute('src'),
                    name: imgs[j].dataset.name || null
                })
            }
            const obj = {
                $container: $container,
                parentId: el.getAttribute("id"),
                parent: el,
                width: el.clientWidth,
                height: el.clientHeight,
                imagesRatio: el.dataset.ratio || 1.0,
                intensity: el.dataset.intensity || 1,
                speedIn: el.dataset.speedin || 1.6,
                speedOut: el.dataset.speedout || 1.2,
                easing: el.dataset.easing || Expo.easeOut,
                hover: el.dataset.hover || true,
                images: arImages,
                displacementImage: el.dataset.displacement,
                commonAngle: el.dataset.angle || Math.PI / 4, //default 45 deg
                angle1: el.dataset.angle1 || Math.PI / 4,
                angle2: el.dataset.angle2 || (-Math.PI / 4) * 3,
                video: el.dataset.video || false
            }

            loadAllTextures(arImages, (result) => {
                this.dataObj.push(obj);
                this.startRender(result, i);
            })
        }
    }
    startRender(arTextures, index) {
        const obj = this.dataObj[index];
        obj.textures = arTextures;
        const scene = new SceneDistortion({
            $container: obj.$container,
            size: {
                width: obj.width,
                height: obj.height
            }
        });
        const mesh = new MeshComponent(obj);
        scene.mainScene.add(mesh.createMesh());
        this.scenes.push(scene);
        this.meshes[obj.parentId] = mesh;
        scene.update();
    }
    eventClickNextSlide() {
        $('.js-next-slide').click((e) => {
            const _this = e.currentTarget;
            const parent = $(_this).closest('.js-distortion-img-wrapper');
            const prev = parent.find('.js-distortion-img.active');
            const next = prev.next('.js-distortion-img');
            if (next.length === 0) return;
            const parentId = parent.attr("id");
            parent.find('.js-distortion-img').removeClass("active");
            next.addClass("active");
            /////////
            const mesh = this.meshes[parentId];
            this.updatePrevNextUniforms(mesh, prev[0].dataset.name, next[0].dataset.name);
            mesh.setDispFactor();
            _this.setAttribute('disabled' , true);
            mesh.transitionIn(() => {
                _this.removeAttribute('disabled');
            });
        })
    }
    eventClickPrevSlide() {
        $('.js-prev-slide').click((e) => {
            const _this = e.currentTarget;
            const parent = $(_this).closest('.js-distortion-img-wrapper');
            const next = parent.find('.js-distortion-img.active');
            const prev = next.prev('.js-distortion-img');
            if (prev.length === 0) return;
            const parentId = parent.attr("id");
            parent.find('.js-distortion-img').removeClass("active");
            prev.addClass("active");
            /////////
            const mesh = this.meshes[parentId];
            this.updatePrevNextUniforms(mesh, prev[0].dataset.name, next[0].dataset.name);
            mesh.setDispFactor(1);
            _this.setAttribute('disabled' , true);
            mesh.transitionOut(() => {
                _this.removeAttribute('disabled');
            });
        })
    }
    updatePrevNextUniforms(mesh, prevName, nextName){
        const prevTexture = getTextureByName(mesh.data.textures, prevName);
        const nextTexture = getTextureByName(mesh.data.textures, nextName);
        mesh.setFilterPrevNextTexture(prevTexture, nextTexture);
        mesh.updatePrevNextTexture(prevTexture, nextTexture);
    }
}