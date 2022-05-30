import SceneSoapBubble from "../components/soap-bubble/scene";


export default class SoapBubble {
    constructor(){
        this.$container = document.getElementById("cv-soap-bubble");
        this.bannerTexSrc = document.getElementById("js-banner-soap").src;
        this.scene = new SceneSoapBubble({
            $container : this.$container,
            bannerTexSrc : this.bannerTexSrc
        })
        this.init();
    }
    init(){

    }
}