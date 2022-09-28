
import  SceneFontLoader from '../components/fontLoader/scene';


export default class FontLoaderTest {
    constructor(){
        this.$container = document.getElementById("cv-font-loader");
        this.scene = new SceneFontLoader({
            $container : this.$container
        });
    }
}