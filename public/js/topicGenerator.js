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
				var machine4 = $("#casino1").slotMachine({
					active	: 0,
					delay	: 1000,
					direction: 'down'
				});

				var machine5 = $("#casino2").slotMachine({
					active	: 1,
					delay	: 1000,
					direction: 'down'
				});

				machine6 = $("#casino3").slotMachine({
					active	: 2,
					delay	: 1000,
					direction: 'down'
				});

				var started = 0;

				$("#slotMachineButtonShuffle").click(function(){
					started = 3;
					machine4.shuffle();
					machine5.shuffle();
					machine6.shuffle();
				});

				$("#slotMachineButtonStop").click(function(){
					switch(started){
						case 3:
							machine4.stop();
							break;
						case 2:
							machine5.stop();
							break;
						case 1:
							machine6.stop();
							break;
					}
					started--;
				});
			});