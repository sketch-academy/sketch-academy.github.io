$(function () {
    $('.name').textillate();
    //init();
})
    

var init = function()
{
	$('#foo').slotMachine({
    randomize : function(activeElementIndex){
        return 0;
    }
	});

	$(".name").slotMachine({
		active	: 1,
		delay	: 450,
		auto	: 1500
	});
}


// $(document).ready(function(){
// 	var machine = $("#planeMachine").slotMachine({
// 	    active  : 1,
// 	    delay   : 450,
	    
// 	    spins	: 10,
// 	    direction: 'down'
// 	});
// 	machine.shuffle(10);
// });


$(document).ready(function(){
                        //$('draw-btn').
                var characters = ['椅子', '鉛筆', '三隻貓咪', '月亮', '男孩', '狗', '女孩', '太陽', '水壺', '哈利波特', '忍者', '死神', '吸血鬼', '小精靈', '殭屍'];

                characters.forEach(function(character){
                $('#casino1').append("<div class='slot slot1'><p>"+character+"</p></div>");
                });
                

                var places = ['房間','棒球場','無人島','茶杯裡','水溝','教室','太空','走廊','公園','廚房','馬路','鋼索','天空','屋頂','沙灘上'];
                places.forEach(function(place){
                $('#casino2').append("<div class='slot slot1'><p>"+place+"</p></div>");
                });

                var verbs = ['跳舞', '睡覺', '打毛線', '爬樓梯', '蹲', '跑步', '伏地挺身', '學習', '擁抱', '下腰閃子彈', '飛行', '喝咖啡', '唱歌', '灌籃', '讀書'];
                verbs.forEach(function(verb){
                $('#casino3').append("<div class='slot slot1'><p>"+verb+"</p></div>");
                });
            


				var machine1 = $("#casino1").slotMachine({
					active	: 0,
					delay	: 1000,
					direction: 'down'
				});

				var machine2 = $("#casino2").slotMachine({
					active	: 1,
					delay	: 1000,
					direction: 'down'
				});

				machine3 = $("#casino3").slotMachine({
					active	: 2,
					delay	: 1000,
					direction: 'down'
				});

				var started = 0;

				$("#slotMachineButtonShuffle").click(function(){
					started = 3;
					machine1.shuffle();
					machine2.shuffle();
					machine3.shuffle();
					$('#draw-btn').hide();
				});
				$('#draw-btn').hide();
				$("#slotMachineButtonStop").click(function(){
					switch(started){
						case 3:
							machine1.stop();
							break;
						case 2:
							machine2.stop();
							break;
						case 1:
							machine3.stop();
							break;
					}
					if(started>0)
						started--;
					if(started == 0)
					{
						$('#draw-btn').show();
						$('#draw-btn').attr('href',"/drawing?ch="+characters[machine1.active]+'&place='+places[machine2.active]+'&verb='+verbs[machine3.active]);
					}
				});
			});