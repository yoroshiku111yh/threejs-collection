import * as THREE from 'three';

export const getResolution = ({ imageAspect = 1, W, H }) => {
    let a1, a2;
    const reso = new THREE.Vector4();
    if (H / W > imageAspect) {
        a1 = (W / H) * imageAspect;
        a2 = 1;
    } else {
        a1 = 1;
        a2 = (H / W) / imageAspect;
    }
    reso.x = W;
    reso.y = H;
    reso.z = a1;
    reso.w = a2;
    return reso;
}


export const getResolutionWithoutImageAspect = ({W, H}) => {
    const dpr = window.devicePixelRatio;
    return new THREE.Vector2(
        W * dpr,
        H * dpr
    )
}

export const getResolutionVec3 = ({W, H}) => {
    const dpr = window.devicePixelRatio;
    console.log(window.devicePixelRatio);
    return new THREE.Vector3(W, H, dpr);
}