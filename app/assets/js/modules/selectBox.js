export default class selectBox {
    constructor() {
        this.ele = '.js-selectBox';
        this.eleClass = 'select-box';
        this.init();
        this.controller();
        this.clickBodyToHideDropDown();
        myApp['selectBoxInit'] = this.init.bind(this);
        myApp['selectBoxDestroy'] = this.destroy.bind(this);
        myApp['selectBoxReInit'] = this.reInit.bind(this);
    }
    init() {
        $(this.ele).each((index,ele)=> {
            this.initSelect(ele);
        })
    }
    initSelect(selectBox) {
        const _this = $(selectBox);
        const _selectItem = _this.children();
        const _selectItemSelected = _this.children('option:selected');
        let i;
        _this.addClass(this.eleClass+'__select').wrap(`<div class="${this.eleClass}"></div>`);
        _this.before(`<span class="${this.eleClass}__current">${_selectItemSelected.text()}</span>`);
        _this.before(`<ul class="${this.eleClass}__dropdown"></ul>`);
        for( i = 0 ;i < _selectItem.length ; i++ ) {
            if(i != _selectItemSelected.index()) {
                _this.prev('ul').append(`<li data-value="${_selectItem.eq(i).attr('value')}">${_selectItem.eq(i).text()}</li>`);
            } else {
                _this.prev('ul').append(`<li class="active" data-value="${_selectItem.eq(i).attr('value')}">${_selectItem.eq(i).text()}</li>`);
            }
        }
    }
    controller() {
        const _selectItem = $('.'+this.eleClass).find('li');
        _selectItem.on('click', (e)=> {
            const _this = $(e.currentTarget);
            const _selectBox = _this.closest('.'+this.eleClass);
            _selectBox.find(`.${this.eleClass}__select`).val(_this.attr('data-value')).trigger('change'); // Trigger real select
        })

        const _selectCurrent = $('.'+this.eleClass).find(`.${this.eleClass}__current`);
        _selectCurrent.on('click', (e)=> {
            const _this = $(e.currentTarget);
            const _selectBox = _this.closest('.'+this.eleClass);
            if(!_selectBox.hasClass('open')){
                $(`.${this.eleClass}.open`).removeClass('open'); // Close all dropdown
                _selectBox.addClass('open');
            }
            else{
                $(`.${this.eleClass}.open`).removeClass('open'); // Close all dropdown
            }
        })

        const _selectMain = $(this.ele);
        _selectMain.on('change', (e)=> {
            //console.log(this);
            const _this = $(e.currentTarget);
            const val = _this.val();
            _this.siblings(`.${this.eleClass}__dropdown`).find('li[data-value="'+val+'"]').addClass('active').siblings('li').removeClass('active');
            _this.siblings(`.${this.eleClass}__current`).text(_this.find('option:selected').text());
        })


    }
    clickBodyToHideDropDown() {
        $(document).on('click', (e)=> {
            if ($(e.target).closest(`.${this.eleClass}__current`).length == 0) {
                $(`.${this.eleClass}`).removeClass('open');
            }
        })
    }
    destroy() {
        const $select = $(this.ele).removeClass(this.eleClass+'__select')
        $select.siblings().remove();
        $select.unwrap();
    }
    reInit() {
        this.destroy();
        this.init();
        this.controller();
    }

};
