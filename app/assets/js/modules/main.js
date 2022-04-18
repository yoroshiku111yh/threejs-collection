import conf from './conf';

export default class Main {
    constructor() {
        //
        this.totalColumn = conf.columns[this.getViewportSize(window.innerWidth)];
        this.resizeCallback = 0;
        this.main = document.getElementById('main');
        this.articles = [...this.main.children];
        this.initEvents();
        //
        window.addEventListener('mousewheel', e => this.onScroll(e), { passive: true });
        window.addEventListener('resize', () => this.onResize(), { passive: true });
    }

    initEvents() {
        this.articles.forEach(item => {});
    }

    onScroll(e) {
        /* console.log(e.deltaY); */
    }

    onResize() {
        clearTimeout(this.resizeCallback);
        this.resizeCallback = setTimeout(() => {
            this.totalColumn = conf.columns[this.getViewportSize(window.innerWidth)];
        }, 300);
    }

    getViewportSize(width) {
        if (width < conf.breakpoints.xs) {
            return 'xs';
        } else if (width < conf.breakpoints.small) {
            return 'small';
        } else if (width < conf.breakpoints.medium) {
            return 'medium';
        } else {
            return 'large';
        }
    }
}