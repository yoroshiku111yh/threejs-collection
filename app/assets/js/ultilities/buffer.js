import * as THREE from 'three';

export class BufferManager {
    constructor(renderer, size, filter = THREE.LinearFilter, wrap = THREE.ClampToEdgeWrapping) {

        this.renderer = renderer;
        this.readBuffer = new THREE.WebGLRenderTarget(size.width, size.height, {
            wrapS : wrap,
            wrapT : wrap,
            minFilter: filter,
            magFilter: filter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });

        this.writeBuffer = this.readBuffer.clone();

    }

    swap() {
        const temp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = temp;
    }

    render(scene, camera, toScreen = false) {
        if (toScreen) {
            this.renderer.render(scene, camera);
        } else {
            this.renderer.setRenderTarget(this.writeBuffer);
            this.renderer.clear();
            this.renderer.render(scene, camera)
            this.renderer.setRenderTarget(null);
        }
        this.swap();
    }

}


export class BufferShader {

    constructor(fragmentShader, vertexShader, uniforms = {}, scale = new THREE.Vector2()) {

        this.uniforms = uniforms;
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            uniforms: uniforms
        });
        this.scene = new THREE.Scene();
        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), this.material);
        this.plane.scale.set(scale.x, scale.y);
        this.scene.add(
            this.plane
        );
    }

}