import { GLTFLoader } from '../jsm/loaders/gltfLoader';
import { DRACOLoader } from '../../three/jsm/loaders/DracoLoader.js';

export class LoaderGLTF {
    constructor({src, resolve, reject}) {
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/r147/examples/js/libs/draco/');
        this.src = src;
        this.resolve = resolve;
        this.reject = reject;
        this.loader = new GLTFLoader();
        this.loader.setDRACOLoader(this.dracoLoader);
        this.load();
    }
    load() {
        this.loader.load(this.src,
            (gltf) => {
                this.resolve(gltf);
            },
            undefined,
            (error) => {
                if(!this.reject){
                    console.error(error);
                    return;
                }
                this.reject(error);
            })
    }
}