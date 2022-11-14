import * as THREE from 'three';
import { FACE_MESH_INDEX_BUFFER, FACE_MESH_UV } from './faceGeo';

///https://github.com/breathingcyborg/mediapipe-face-effects/blob/063aba4f46816064d67d682a8350284a4fbe3d60/src/js/facemesh/landmarks_helpers.js#L17

export const transformLandmarks = (landmarks) => {
    if (!landmarks) {
        return landmarks;
    }

    let hasVisiblity = !!landmarks.find(l => l.visibility);

    let minZ = 1e-4;

    // currently mediapipe facemesh js
    // has visibility set to undefined
    // so we use a heuristic to set z position of facemesh
    if (hasVisiblity) {
        landmarks.forEach(landmark => {
            let { z, visibility } = landmark;
            z = -z;
            if (z < minZ && visibility) {
                minZ = z
            }
        });
    } else {
        minZ = Math.max(-landmarks[234].z, -landmarks[454].z);
    }

    return landmarks.map(landmark => {
        let { x, y, z } = landmark;
        return {
            x: -0.5 + x,
            y: 0.5 - y,
            z: -z - minZ,
            visibility: landmark.visibility,
        }
    });
}

export const makeGeometry = (landmarks) => {
    let geometry = new THREE.BufferGeometry();
    if(landmarks.length === 0){
        const verticesSample = new Float32Array( [
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
        
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0
        ] );
        geometry.setAttribute('position', new THREE.BufferAttribute(verticesSample, 3));
        return geometry;
    }
    let vertices = [];
    let uvs = [];

    for (let i = 0; i < 468; i++) {
        let { x, y, z } = landmarks[i];
        let vertex = [x, y, z];
        vertices.push(...vertex);
    }
    for (let j = 0; j < 468; j++) {
        uvs[j * 2] = FACE_MESH_UV[j][0];
        uvs[j * 2 + 1] = FACE_MESH_UV[j][1];
    }
    let _uvs = new Float32Array(uvs);
    let _vertices = new Float32Array(vertices);
    geometry.setIndex(FACE_MESH_INDEX_BUFFER);
    geometry.setAttribute('position', new THREE.BufferAttribute(_vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(_uvs, 2));
    geometry.computeVertexNormals();

    return geometry;
}

export const scaleLandmark = (landmark, width, height) => {
    let { x, y, z } = landmark;
    return {
        ...landmark,
        x: x * width,
        y: y * height,
        z: z * width,
    }
}