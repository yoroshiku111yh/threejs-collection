/**
 * Created by CLIMAX PRODUCTION on 6/18/2019.
 */
export default class YoutubeAPI{
    constructor(){
        this.elm = '.js-youtube';
        this.btnPlay = '.js-play-youtube';
        this.btnToggleMute = '.js-toggle-mute';
        this.btnPause = '.js-pause-youtube';
        this.pauseAll = '.js-pause-all';
        this.player;
        this.playerElm = [];
        this.players = [];
        myApp['playerNow'] = this.playerNow;
        this.idVideoPlaying = '';
        this.idPlayerNow = '';
        this.IsAutoPlay = false;
        this.wrapper = '.js-youtube-wrapper';
        myApp['endVideo'] = this.endPause.bind(this);
        myApp['getPlayerInArray'] = this.getPlayerInArray.bind(this);
        myApp['playVideo'] = this.playVid.bind(this);
        myApp['pauseAllVideo'] = this.pauseAllFn.bind(this);
        this.init();
    }
    init(){
        this.insertScript();
        this.playersInPage();
        this.btn();
    }
    getPlayerInArray(idPlayer){
        for(let i = 0 ; i < this.players.length; i++){
            let _idPlayer = this.players[i]['id'];
            if(idPlayer === _idPlayer){
                return this.players[i]['player'];
            }
        }
    }
    playersInPage(){
        let elms = $(this.elm);
        this.IsAutoPlay = false;
        for(let i = 0 ; i < elms.length ; i++){
            let item = $(elms[i]);
            let idPlayer = item.attr('id');
            let idVideo = item.attr('id-video');
            let autoPlay = item.attr('auto-play');
            if(autoPlay && this.IsAutoPlay == false){ // JUST PLAY FIRST VIDEO HAVE ATTRIBUTE AUTO PLAY ON
                this.IsAutoPlay = true;
                this.idPlayerNow = idPlayer;
                this.idVideoPlaying = idVideo;
            }
            this.playerElm.push({
                idVideo : idVideo,
                idPlayer : idPlayer
            });
        }
        this.playerAPI();
    }
    insertScript(){
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
    }
    playerAPI(){
        window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);
    }
    onYouTubeIframeAPIReady(){
        for(let i = 0 ; i < this.playerElm.length ; i++){
            let elm = this.playerElm[i];
            let inLine = $('#' + elm.idPlayer).attr('inline');
            let player = this.createPlayer(elm.idPlayer, elm.idVideo, inLine);
            this.players.push({
                'player' : player,
                'id' : elm.idPlayer,
                'idVideo' : elm.idVideo
            });
        }
    }
    createPlayer(idPlayer, idVideo, isInline){
        return new YT.Player(idPlayer, {
            height : '100%',
            width : '100%',
            videoId : idVideo,
            playerVars: {
                'controls': 0,
                'rel' : 0,
                'fs' : 0,
                'playsinline' : isInline ? 1 : 0,
            },
            events: {
                'onReady': this.onPlayerReady.bind(this),
                'onStateChange': this.onPlayerStateChange.bind(this)
            }
        })
    }
    onPlayerReady(event){
        var elm = this.getElmPlayer(event.target);
        let idPlayer = elm.attr('id');
        let W = $(window).width();
        if(elm.attr('muted')) {
            event.target.mute();
        }
        if(idPlayer !== this.idPlayerNow || W < 768) return false;
        this.playVid(elm, event.target); // GOT FIRST VIDEO HAVE ATTRIBUTE AUTO PLAY ON
    }
    onPlayerStateChange(event){
        let playerState = YT.PlayerState;
        switch (event.data){
            case playerState.ENDED :
                this.endPause(event.target);
                break;
            case playerState.PAUSED :
                this.endPause(event.target);
                break;
            default :
                break;
        }
    }
    endPause(player){
        this.hideVid(player);
    }
    getElmPlayer(eventTarget){
        return $(eventTarget.a);
    }
    hideVid(player){
        let elm = this.getElmPlayer(player);
        if(elm.attr('hide-stop')){
            let wrapper = $(elm).parent(this.wrapper);
            wrapper.removeClass('active');
        }
        if(player.isMuted()){
            elm.attr('muted', true);
        }
        else{
            elm.attr('muted', '');
        }
    }
    playVid(elm, player){
        let wrapper = $(elm).parent(this.wrapper);
        wrapper.addClass('active');
        myApp['playerNow'] = this.playerNow = player;
        let start_from = Number($(elm).attr('start-from'));
        if(!isNaN(start_from)){
            player.seekTo(start_from);
        }
        player.playVideo();
        let isMuted = elm.attr('muted');
        if(isMuted){
            player.mute();
        }
        else{
            player.unMute();
        }
    }
    pauseVid(player){
        player.pauseVideo();
        this.endPause(player);
    }
    pauseAllFn(){
        for(let i = 0 ; i < this.players.length; i++){
            let player = this.players[i]['player'];
            this.pauseVid(player);
            this.hideVid(player);
        }
    }
    btn(){
        $(this.btnPlay).unbind('click').click((e) => {
            let _this = $(e.currentTarget);
            let idPlayer = _this.attr('id-player');
            let player = this.getPlayerInArray(idPlayer);
            if(player){
                let elm = $('#'+ idPlayer);
                this.playVid(elm, player);
            }
        })
        $(this.btnToggleMute).unbind('click').click((e) => {
            let _this = $(e.currentTarget);
            let idPlayer = _this.attr('id-player');
            let player = this.getPlayerInArray(idPlayer);
            if(player){
                /*let elm = $('#'+ idPlayer);
                 let wrapper = elm.parent(this.wrapper);
                 if(!wrapper.hasClass('active')) return false;*/
                if(player.isMuted()){
                    _this.addClass('unmute').removeClass('mute');
                }
                else{
                    _this.addClass('mute').removeClass('unmute');
                }
                this.toggleMute(player, player.isMuted());
            }
        });
        $(this.btnPause).unbind('click').click((e) => {
            let _this = $(e.currentTarget);
            let idPlayer = _this.attr('id-player');
            let player = this.getPlayerInArray(idPlayer);
            if(player){
                /*let elm = $('#'+ idPlayer);
                 let wrapper = elm.parent(this.wrapper);
                 if(!wrapper.hasClass('active')) return false;*/
                this.pauseVid(player);
            }
        });
        $(this.pauseAll).unbind('click').click((e) => {
            this.pauseAllFn();
        })
    }
    toggleMute(player, isMuted){
        if(isMuted){
            player.unMute();
        }
        else{
            player.mute();
        }
    }
}