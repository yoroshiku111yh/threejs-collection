import SceneBase from './../../ultilities/sceneBase';
import { clearColorDark } from './../../ultilities/variable';

export default class SceneFontLoader extends SceneBase{
    constructor({$container, size = {}}){
        super($container, size.width, size.height);
        this.init();
    }
    init(){
        this.start();
        this.renderer.setClearColor(new THREE.Color(clearColorDark));
        this.initOrthographicCamera();
        this.update();
    }
}