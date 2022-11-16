
import modelHatXMas from '../../../mediapipe/models/hat/scene.gltf';
import modelGlasses from '../../../mediapipe/models/glass/scene.gltf';

export const materialsEffectMask = [
    {
        type: "2d",
        src: document.getElementById("mediapipe-face-place-holder").src,
        name: "mask-tiger"
    }
];

export const materialsEffectGlasses = [
    {
        type: "3d",
        src: modelGlasses,
        name: "glasses",
        modified : {
            pointInFace : 168,
            spacingMulti : {
                x : 1,
                y : 1,
                z : 1
            },
            scaleMulti : {
                x : 1,
                y : 1,
                z : 1
            }
        }
    },
];

export const materialsEffectHat = [
    {
        type: "3d",
        src: modelHatXMas,
        name: "hat",
        modified : {
            pointInFace : 10,
            spacingMulti : {
                x : 1,
                y : 1,
                z : 1
            },
            scaleMulti : {
                x : 2,
                y : 2,
                z : 2
            }
        }
    },
]