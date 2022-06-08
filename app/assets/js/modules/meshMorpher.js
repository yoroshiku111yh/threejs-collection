
import SceneMeshMorpher from './../components/meshMorpher/scene';

import shark from './../../3dmodel/obj/shark.obj';
import glassWhale from './../../3dmodel/obj/glass-whale.obj';
import icosahedron from './../../3dmodel/obj/icosahedron.obj';
import { LoaderOBJ } from './../ultilities/object3dLoader/obj';

export default class meshMorpher {
    constructor() {
        this.$container = document.getElementById("cv-mesh-morpher");
        this.srcModels = [glassWhale, shark, icosahedron];
        this.models = [];
        this.isLoadedModels = false;
        this.loadAllModels();
    }
    loadAllModels() {
        for (let i = 0; i < this.srcModels.length; i++) {
            const src = this.srcModels[i];
            new LoaderOBJ({
                src: src,
                resolve: (obj) => {
                    const mesh = obj.children[0];
                    this.models.push(mesh);
                    if (this.models.length === this.srcModels.length) {
                        this.init();
                    }
                }
            })
        }
    }
    init() {
        this.scene = new SceneMeshMorpher({
            $container: this.$container,
            models: this.models
        });
    }
}