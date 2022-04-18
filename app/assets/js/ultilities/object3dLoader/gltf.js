import { GLTFLoader } from '../gltfLoader';

export class LoaderGLTF {
    constructor({src, resolve, reject}) {
        this.src = src;
        this.resolve = resolve;
        this.reject = reject;
        this.loader = new GLTFLoader();
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