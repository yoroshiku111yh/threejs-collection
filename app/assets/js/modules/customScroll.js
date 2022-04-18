import jqueryMousewheel from 'jquery-mousewheel';
import mCustomScrollbar from 'malihu-custom-scrollbar-plugin';

export default class customScroll {
    constructor(options = {}, data = []) {
        this.data = data;
        this.options = options;
        this.initEvents();
        myApp['dataXHR'] = this.getData.bind(this.data);
    }

    getData(dataResult) {
        /* console.log(this); */
        /* console.log(dataResult); */
        this.data = dataResult;
        /* console.log(this.data); */
    }

    initEvents() {
        $('.scroll').mCustomScrollbar();
        var arrowLeft = $('.arrow-left');
    }
};
