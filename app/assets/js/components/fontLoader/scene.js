import SceneBase from './../../ultilities/sceneBase';
import { clearColorDark } from './../../ultilities/variable';
import * as THREE from 'three';
import { FontLoader } from '../../ultilities/jsm/loaders/FontLoader';

export default class SceneFontLoader extends SceneBase{
    constructor({$container, size = {}}){
        super($container, size.width, size.height);
        this.loader = new FontLoader(); 
        this.init();
    }
    init(){
        this.start();
        this.renderer.setClearColor(new THREE.Color(clearColorDark));
        this.initOrthographicCamera();
        this.loaderFont();
        this.update();
    }
    loaderFont(){
        let srcFont = document.getElementById("src-font").dataset.src;
        const font = this.loader.load(
            srcFont,
            (font) => {
                const color = 0x006699;
                const matDark = new THREE.LineBasicMaterial({
                    color : color,
                    side : THREE.DoubleSide
                });
                const message = 'Hello ooo';
                const shapes = font.generateShapes(message, 100);
                const geo = new THREE.ShapeGeometry(shapes);
                geo.computeBoundingBox();

                geo.translate(-150, 0, 0);
                const text = new THREE.Mesh(geo, matDark);
                text.position.z = -2;
                this.mainScene.add(text);
            }
        )
    }

}