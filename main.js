(function (window,document){
	'use strict';

	function drawCircle(){
		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");
		context.beginPath();
		context.arc(100,75,50,0,2*Math.PI);
		context.stroke();
	}

	//Note: remember to resize everything when the display size changes
	function init(){

		window.addEventListener ("beforeunload", function() {
			document.body.classList.add("animate-out");
		});
		
		var masthead = document.getElementById('masthead');
		var mastheadHeight;
		if (masthead.offsetHeight){
			mastheadHeight = masthead.offsetHeight;
		} else if (masthead.style.pixelHeight){
			mastheadHeight = masthead.style.pixelHeight;
		}

		var mainContent = document.getElementById('main-body');
		mainContent.style.marginTop = mastheadHeight + 'px';

		

		console.log ("init header")
	}

	window.Window = {
		init : init
	}
})(window,document);

function changeResumeType(){
	console.log ("Change resume type");
	var type = document.getElementById("resumeType").value;
	var pdf = document.getElementById("resumePdf");
	var json = document.getElementById("resumeJson");
	var png = document.getElementById("resumePng");
	if (type == "pdf"){
		pdf.style.display = "block";
		json.style.display = "none";
		png.style.display = "none";
	} else if (type == "json") {
		pdf.style.display = "none";
		json.style.display = "block";
		png.style.display = "none";
	} else if (type == "png") {
		pdf.style.display = "none";
		json.style.display = "none";
		png.style.display = "block";
	}
}

Window.init();