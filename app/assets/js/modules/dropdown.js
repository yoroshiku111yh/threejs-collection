/**
 * Created by CLIMAX PRODUCTION on 1/18/2019.
 */
import  JsDropdown from '../../vendor/dropdown/js-dropdown.js';
export default class Dropdown{
    constructor(){
        this.init();
    }
    init(){
        let dropdown = new JsDropdown();
        dropdown.init();
        /*
            .opt // change option
            .setClass // change class default
            more detail, check file js-dropdown
        */
        document.getElementById("input1").addInputChangedByJsListener(function() {
            var dataTest = [
                {value : 'data 1', text : 'data text 1'},
                {value : 'data 2', text : 'data text 2'},
                {value : 'data 3', text : 'data text 3'},
                {value : 'data 4', text : 'data text 4'},
            ]
            dropdown.reinit('choiceToReInit', dataTest);
            dropdown.dogSay();
        });
    }
}
