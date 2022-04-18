import { OBJLoader } from '../objLoader';

export class LoaderOBJ {
    constructor({ src, resolve, reject = this.rejectFn, processing }) {
        this.src = src;
        this.resolve = resolve;
        this.reject = reject;
        this.processing = processing;
        this.loader = new OBJLoader();
        this.load();
    }
    load() {
        this.loader.load(this.src,
            (obj) => {
                this.resolve(obj);
            },
            (xhr) => {
                if(!this.processing) return;
                this.processing(xhr);
            },
            (error) => {
                this.reject(error)
            }
        )
    }
    rejectFn(err){
        console.log(err);
    }
}