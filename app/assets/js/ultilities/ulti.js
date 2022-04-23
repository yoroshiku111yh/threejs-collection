import { Frustum, Matrix4, Color, Vector4, Vector3, TextureLoader } from "three";

export const checkOutOfViewCamera = ({ obj, camera }) => {
    const frustum = new Frustum()
    const matrix = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(matrix)
    if (!frustum.containsPoint(obj.position)) {
        // Out of view
        return true;
    }
    return false;
}

export const getPositionByRadian = ({ radian, distance, from }) => {
    const x = distance * Math.cos(radian) + from.x;
    const y = distance * Math.sin(radian) + from.y;
    return {
        x: x,
        y: y
    }
}

export const getRadian2Points = ({ point1, point2 }) => {
    const delta_x = point1.x - point2.x;
    const delta_y = point1.y - point2.y;
    return Math.atan2(delta_y, delta_x);
}

export const pointerPos = ({ z = 1, pointer, size }) => {
    return {
        x: (pointer.clientX / size.width) * 2 * z - 1 * z,
        y: - (pointer.clientY / size.height) * 2 * z + 1 * z
    }
}

export const randomInRange = (max, min) => Math.random() * (max - min) + min;

import * as THREE from 'three'

// eslint-disable-next-line import/prefer-default-export
export const clamp = (val, min = 0, max = 1) => Math.max(min, Math.min(max, val))

export const map = (value, min1, max1, min2, max2) => min2 + (max2 - min2) * (value - min1) / (max1 - min1)

export const getRatio = ({ x: w, y: h }, { width, height }, r = 0) => {
    const m = multiplyMatrixAndPoint(rotateMatrix(THREE.Math.degToRad(r)), [w, h])
    const originalRatio = {
        w: m[0] / width,
        h: m[1] / height,
    }

    const coverRatio = 1 / Math.max(originalRatio.w, originalRatio.h)

    return new THREE.Vector2(
        originalRatio.w * coverRatio,
        originalRatio.h * coverRatio,
    )
}


const rotateMatrix = (a) => [Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a)]

const multiplyMatrixAndPoint = (matrix, point) => {
    const c0r0 = matrix[0]
    const c1r0 = matrix[1]
    const c0r1 = matrix[2]
    const c1r1 = matrix[3]
    const x = point[0]
    const y = point[1]
    return [Math.abs(x * c0r0 + y * c0r1), Math.abs(x * c1r0 + y * c1r1)]
}

export const wrap = (el, wrapper) => {
    el.parentNode.insertBefore(wrapper, el)
    wrapper.appendChild(el)
}


export const unwrap = (content) => {
    for (let i = 0; i < content.length; i++) {
        const el = content[i]
        const parent = el.parentNode

        if (parent.parentNode) parent.outerHTML = el.innerHTML
    }
}

export const ev = (eventName, data, once = false) => {
    const e = new CustomEvent(eventName, { detail: data }, { once })
    document.dispatchEvent(e)
}

export const convertThreeColorToVector = (color, isVec4) => {
    const colorThree = new Color(color);
    if (isVec4) {
        return new Vector4(colorThree.r, colorThree.g, colorThree.b, 1);
    }
    return new Vector3(colorThree.r, colorThree.g, colorThree.b);
}

export const convertStringToObject = (string = '') => {
    if (string === null || string.length === 0) return;
    return JSON.parse(string);
}

export const convertStringToUniform = (string = '') => {
    if (string === null || string.length === 0) return;
    const uniforms = {};
    const obj = convertStringToObject(string);
    for (const property in obj) {
        let value = obj[property];
        if (value.toString().indexOf('colorType-') !== -1) {
            value = value.replace('colorType-', '');
            value = convertThreeColorToVector(value, true);
        }
        if (value.toString().indexOf('textureType-') !== -1) {
            value = value.replace('textureType-', '');
            value = new TextureLoader().load(value);
        }
        uniforms[property] = { value: value }
    }
    return uniforms
}

export const loadAllTextures = (arTextures, callback) => {
    const loader = new TextureLoader();
    let count = 0;
    const arResult = [];
    let isError = false;
    for (let i = 0; i < arTextures.length; i++) {
        const texture = arTextures[i];
        loader.load(
            texture.src,
            (tex) => {
                count++;
                tex.name = texture.name;
                arResult[i] = tex;
                if(count === arTextures.length && !isError){
                    callback(arResult);
                }
            },
            undefined,
            (err) => {
                isError = true;
                console.log('Error load texture:' + texture.src);
                console.log(err);
            }
        )
    }
}

export const getTextureByName = (arTexture, name) => {
    for(let i = 0 ; i < arTexture.length; i++){
        const texture = arTexture[i];
        if(texture.name === name){
            return texture;
        }
    }
}


export const degToRad = ( deg ) => {
    return deg*Math.PI/180;
};