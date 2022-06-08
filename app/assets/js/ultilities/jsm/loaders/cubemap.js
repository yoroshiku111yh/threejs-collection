import { CubeTextureLoader } from 'three';

export class loadNewCubeMap {
    constructor({ path, resolve }) {
        this.resolve = resolve;
        this.path = path;
        this.init();
    }
    init() {
        this.cube = new CubeTextureLoader()
            .setPath(this.path)
            .load([
                'px.png',
                'nx.png',
                'py.png',
                'ny.png',
                'pz.png',
                'nz.png'
            ], (cube) => {
                this.resolve(cube);
            }, (error) => {
                console.error(error);
            });
    }
}