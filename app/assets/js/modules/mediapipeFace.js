
import 'regenerator-runtime/runtime';
import { transformLandmarks } from '../helpers/landmarksHelper';
import SceneBase from '../components/sceneBase';
import PlaneMask2d from './../components/planeMask2d';


export default class MediaPipeFace {
    constructor() {
        this.inputImage = document.getElementById("mediapipe-image-input");
        this.inputVideo = document.getElementById("mediapipe-vid-input");
        this.outputCanvas = document.getElementById("mediapipe-output");
        this.inputFacePlaceHolder = document.getElementById("mediapipe-face-place-holder");
        this.isUseVideoInput = false;
        this.facesPlane = [];
        this.init()
    }
    init() {
        this.mainScene = new SceneBase(this.outputCanvas, { width: this.inputImage.width, height: this.inputImage.height });
        this.mainScene.bg.setTexture(this.inputImage.src);
        this.initFaceMesh();
        this.faceMesh.send({
            image: this.inputImage
        })
    }
    initFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        this.faceMesh.setOptions({
            maxNumFaces: 3,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.faceMesh.onResults(this.onResults.bind(this));
    }
    onResults(results) {
        if (results.multiFaceLandmarks) {
            this.removeFacesMask();
            for (const landmarks of results.multiFaceLandmarks) {
                console.log(landmarks);
                const faceLandmarks = transformLandmarks(landmarks);
                const mask = new PlaneMask2d(this.mainScene.scene, this.mainScene.size, faceLandmarks);
                mask.setTexture(this.inputFacePlaceHolder.src);
                this.facesPlane.push(mask);
            }
            this.renderFacesMask();
        }
    }
    renderFacesMask(){
        for(let i = 0 ; i < this.facesPlane.length; i++){
            this.facesPlane[i].createPlane();
        }
    }
    removeFacesMask(){
        for(let i = 0 ; i < this.facesPlane.length; i++){
            this.facesPlane[i].removePlane();
        }
    }
    // init() {
    //     this.ctx = this.outputCanvas.getContext("2d");
    //     this.initFaceMesh();
    //     if (!this.isUseVideoInput) {
    //         this.inputVideo.parentNode.classList.remove("active");
    //         this.inputImage.parentNode.classList.add("active");
    //         this.setSizeCanvasOutput(this.inputImage);
    //         this.sendInputImage(this.inputImage);
    //     }
    //     else {
    //         this.inputImage.parentNode.classList.remove("active");
    //         this.inputVideo.parentNode.classList.add("active");
    //         this.loadVideo((video) => {
    //             this.setSizeCanvasOutput({
    //                 width: video.videoWidth,
    //                 height: video.videoHeight
    //             });
    //         });
    //         this.eventPlayVideo();
    //     }
    // }
    // setSizeCanvasOutput(size) {
    //     this.outputCanvas.width = size.width;
    //     this.outputCanvas.height = size.height;
    // }
    // onResults(results) {
    //     this.ctx.save();
    //     this.ctx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
    //     this.ctx.drawImage(
    //         results.image, 0, 0, this.outputCanvas.width, this.outputCanvas.height);
    //     if (results.multiFaceLandmarks) {
    //         for (const landmarks of results.multiFaceLandmarks) {
    //             console.log(landmarks);
    //             drawConnectors(this.ctx, landmarks, FACEMESH_TESSELATION,
    //                 { color: '#C0C0C070', lineWidth: 1 });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
    //             // drawConnectors(this.ctx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
    //         }
    //     }
    //     this.ctx.restore();
    // }
    // initFaceMesh() {
    //     this.faceMesh = new FaceMesh({
    //         locateFile: (file) => {
    //             return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    //         }
    //     });

    //     this.faceMesh.setOptions({
    //         maxNumFaces: 3,
    //         refineLandmarks: true,
    //         minDetectionConfidence: 0.5,
    //         minTrackingConfidence: 0.5
    //     });

    //     this.faceMesh.onResults(this.onResults.bind(this));
    // }
    // sendInputImage(inputImage) {
    //     this.faceMesh.send({
    //         image: inputImage
    //     })
    // }
    // eventPlayVideo() {
    //     this.inputVideo.addEventListener('play', (e) => {
    //         this.getFrameVideo();
    //     })
    // }
    // async getFrameVideo() {
    //     const video = this.inputVideo;
    //     if (video.ended || video.paused) return;
    //     await this.faceMesh.send({
    //         image: video
    //     });
    //     await new Promise(requestAnimationFrame);
    //     this.getFrameVideo();
    // }
    // loadVideo(callback) {
    //     this.inputVideo.addEventListener("loadedmetadata", (e) => {
    //         const $this = e.target;
    //         callback && callback($this);
    //     })
    // }
}
