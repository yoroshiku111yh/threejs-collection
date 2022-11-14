import { FaceMesh } from "@mediapipe/face_mesh";

export default class FaceMeshMediapipe {
    constructor(onResults = () => {}, options = {}) {
        this.onResults = onResults;
        this.options = options;
        this.faceMesh;
        this.init();
    }
    init() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });
        const defaultOptions = {
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        };
        this.faceMesh.setOptions({...defaultOptions, ...this.options});

        this.faceMesh.onResults(this.onResults);
    }
}