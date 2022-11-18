

export default class CaptureCanvasToVideo{
    constructor(canvas){
        this.fps = 30;
        this.mlSecond = 1000;
        this.canvas = canvas;
        this.nameFile = "video-sample.webm";
        this.chunks = [];
        this.blob = null;
        this.canvasStream = this.canvas.captureStream(this.fps);
        this.init();
    }
    init(){
        this.mediaRecorder = new MediaRecorder(this.canvasStream, {
            mimeType : "video/webm; codecs=vp9"
        });
        this.onEvent();
    }
    onEvent(){
        this.mediaRecorder.ondataavailable = (e) => {
            this.chunks.push(e.data);
        };
        this.mediaRecorder.onstop = () => {
            console.log(this.chunks);
        }
    }
    start(){
        this.chunks = [];
        this.blob = null;
        this.mediaRecorder.start(this.mlSecond);
    }
    stop(){
        this.mediaRecorder.stop();
    }
    setNameFile(nameFile){
        this.nameFile = `${nameFile}.webm`;
    }
    download(){
        this.blob = new Blob(this.chunks, { type : "video/webm" });
        const recordUrl = URL.createObjectURL(this.blob);
        const a = document.createElement("a");
        a.style = "display : none";
        a.href = recordUrl;
        a.download = this.nameFile;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(recordUrl);
            document.body.removeChild(a);
        }) /// to fix bug in Edge
    }
}