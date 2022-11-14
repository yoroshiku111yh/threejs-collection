
import * as THREE from 'three';

export default class Texture2d {
    constructor({ textureSrc, callbackLoaded = () => {} }) {
        this.textureSrc = textureSrc;
        this.texture;
        this.isLoaded = false;
        this.callbackLoaded = callbackLoaded;
        this.load();
    }
    load() {
        new THREE.TextureLoader().load(
            this.textureSrc,
            this.resolve.bind(this),
            undefined,
            (err) => { console.error(err) }
        );
    }
    resolve(texture) {
        this.texture = texture;
        this.texture.needsUpdate = true;
        this.isLoaded = true;
        this.callbackLoaded(texture);
    }
    cloneTexture(){
        if(!this.isLoaded) return;
        return this.texture.clone(); 
    }
    getSrc(){
        return this.textureSrc;
    }

}