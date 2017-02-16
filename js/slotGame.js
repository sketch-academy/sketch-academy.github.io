var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
var game_ch = getUrlParameter('ch')
var game_place = getUrlParameter('place')
var game_verb = getUrlParameter('verb')
$(document).ready(function(){
    game_ch = getUrlParameter('ch');
    game_place = getUrlParameter('place')
    game_verb = getUrlParameter('verb')
    if(game_ch!=null)
    $('#slot-game-items').text('遊戲題目：甩頭鴿和'+game_ch+'在'+game_place+game_verb);
    $('#rule').text('將你依照題目指示的畫作Po上我們的每日畫圖挑戰活動頁面讓大家猜猜看喔！');
});