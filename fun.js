(function (window,document){
	'use strict';

	function drawCircle(){
		
		ctx.clearRect (0,0,c.width, c.height);
		
		//ctx.canvas.width = "500px";//window.innerWidth;
		//ctx.canvas.height = "500px";//window.innerHeight;
		ctx.beginPath();
		ctx.arc(circleX,circleY,circleRadius,0,2*Math.PI);

		
		//ctx.stroke();
		lines.forEach(function (line) {
			ctx.moveTo (line.x1, line.y1);
			ctx.lineTo (line.x2, line.y2);
		});


		points.forEach (function (point) {
			ctx.fillRect(point.x, point.y, 1, 1);
		})
		
		ctx.stroke();
	}

	var circleX = 110;
	var circleY = 170;
	var circleVel = {
		x : 0,
		y : -0.1
	};
	var circleRadius = 20;
	var prevTime = 0
	var epsilon = 0.00001
	function moveCircle(){

		var currentTime = Date.now();
		var timeLeft = currentTime - prevTime;

		//console.log (timeLeft);
		var halting = false;

		var collisionCounter = 0
		while (timeLeft > epsilon) {
			//line collisions
			//Can use the first point, because all the lines are 90 angles and borders. Would not work with other types of lines
			var collision = {
				time : Number.MAX_VALUE,
				collisionResponse : {},
				shape : null
			}
			
			
			lines.forEach (function (line) {
				//horizontal
				var radiusOffset = line.x1 >= circleX ? circleRadius : -circleRadius;
				var collisionTimeX = (line.x1 - circleX - radiusOffset) / circleVel.x;
				if (collisionTimeX >= 0 && collisionTimeX < timeLeft && collisionTimeX < collision.time) {
					collision.time = collisionTimeX;
					collision.collisionResponse = collisionResponseLineHorizontal
					collision.shape = line;
				}

				//Vertical
				radiusOffset = line.y1 >= circleY ? circleRadius : -circleRadius;
				var collisionTimeY = (line.y1 - circleY - radiusOffset) / circleVel.y;
				if (collisionTimeY >= 0 && collisionTimeY < timeLeft && collisionTimeY < collision.time) {
					collision.time = collisionTimeY;
					collision.collisionResponse = collisionResponseLineVertical
					collision.shape = line;
				}
			})



			
			points.forEach ( function (point) {
				//Get the circle endpoint
				var circleEndPoint = {
					x : circleX + circleVel.x * timeLeft,
					y :	circleY + circleVel.y * timeLeft
				}
				//console.log ("acknowledge point");

				//get Point of shortest distance
				//First, find standard form of line
				//y = mx + b -> 0 = mx - y + b
				//Standard form = ax + by + c = 0
				var slope = (circleEndPoint.y - circleY) / (circleEndPoint.x - circleX);
				//console.log (slope);
				var a, b, c;
				if (slope == Infinity || slope == -Infinity) {
					a = 1;
					b = 0;
					c = -circleX;
				} else {
				 a = slope;
				 b = -1;
				 c = circleY - (slope * circleX);
				}

				//Next, find the point on the line and distance
				var a2plusb2 = Math.pow (a, 2) + Math.pow (b, 2);
				var closestPoint = {
					x : (b * (b * point.x - a * point.y) - a * c) / a2plusb2,
					y : (a * (-b * point.x + a * point.y) - b * c) / a2plusb2
				}
				var distance = Math.abs (a * point.x + b * point.y + c) / a2plusb2;
				//console.log (distance);
				//Check if collision is possible
				if (circleRadius >= distance) {
					//Get distance from closest point to collision point
					var distanceFromClosestPoint = Math.sqrt (Math.pow (circleRadius, 2) - Math.pow (distance, 2));
					//Find the collision point
					//Get unit vector for circle velocity
					var velocityMag = Math.sqrt (Math.pow (circleVel.x, 2) + Math.pow (circleVel.y, 2));
					var velocityUnitVector = {
						x : circleVel.x / velocityMag,
						y : circleVel.y / velocityMag
					}
					
					
					//3 Possible scenarios
					//1. closer collision point is on the line -> take the closer point
					//2. closer collision point is farther than end point -> A collision won't occur in the given time frame, but may later
					//3. closer collision point is earlier than circle point -> This is an error. This means the circle is overlapping with the point.
																	 		  //Should find a way to push the circle away

					
					var closerCollisionPoint = {
						x : closestPoint.x - velocityUnitVector.x * distanceFromClosestPoint,
						y : closestPoint.y - velocityUnitVector.y * distanceFromClosestPoint
					}

					//Note: Is it faster to just use x (or y if velX = 0) position? Would have to compensate for vector direction
					//Find distance relative to velocity vector
					var vectorDistanceToEndPoint = scalarMultipleOfVector (circleVel, {x : circleX, y : circleY}, circleEndPoint);
					var vectorDistanceToCollisionPoint = scalarMultipleOfVector (circleVel, {x : circleX, y : circleY}, closerCollisionPoint);

					if (vectorDistanceToCollisionPoint >= 0 && vectorDistanceToCollisionPoint <= vectorDistanceToEndPoint) {
						//collision.time = scalarMultipleOfVector ({x : circleVel.x, y : circleVel.y}, {x : circleX, y : circleY}, closerCollisionPoint);
						collision.time = scalarMultipleOfVector (velocityUnitVector, {x : circleX, y : circleY}, closerCollisionPoint);
						collision.collisionResponse = collisionResponsePoint;
						collision.shape = point;


						halting = true;
						console.log ("unit vector");
						console.log (velocityUnitVector);

						console.log ("time left");
						console.log (timeLeft);

						console.log ("scalar distances");
						console.log (vectorDistanceToEndPoint);
						console.log (vectorDistanceToCollisionPoint);

						console.log ("Points");

						console.log (closerCollisionPoint);

						console.log ({x : circleX, y: circleY});
						console.log (circleEndPoint);
						console.log (collision);

						ctx.beginPath();
						ctx.moveTo (circleX, circleY);
						ctx.lineTo (point.x, point.y);

						//draw velocity
						ctx.moveTo (circleX, circleY);
						ctx.lineTo (circleX + velocityUnitVector.x * 40, circleY + velocityUnitVector.y * 40);
						ctx.stroke();

						//clearInterval (animation);
					}

					//Otherwise, ignore the result

				}
			})
			
			if (collision.shape != null) {
				
				console.log (collision.time);
				collision.collisionResponse (collision.shape, collision.time);

				//draw velocity
				//ctx.strokeStyle="#FF0000";
						ctx.moveTo (circleX, circleY);
						ctx.lineTo (circleX + circleVel.x * 500, circleY + circleVel.y * 500);
						ctx.stroke();

				timeLeft-= collision.time;
				collisionCounter++;
			} else {
				circleX+= circleVel.x*timeLeft;
				circleY+= circleVel.y*timeLeft;
				timeLeft = 0
			}


			if (collisionCounter > 2) {
				circleX+= circleVel.x*timeLeft;
				circleY+= circleVel.y*timeLeft;
				timeLeft = 0
				clearInterval (animation);


			}
			
		}

		if (!halting) {
			drawCircle();
		}

		prevTime = Date.now();
	}

	function moveCircleTest () {
		circleX+= circleVel.x*50;
		circleY+= circleVel.y*50;
		drawCircle();
	}

	var animation;
	var c;
	var ctx;
	function startAnimation (){
		c = document.getElementById("myCanvas");
		ctx = c.getContext("2d");
		prevTime = Date.now();
		animation = setInterval(moveCircle, 50);
	}

	/*
	Notes : TODO
	Functions
	-Point collision reaction
	-Point collision time

	*/
	function collisionResponseLineHorizontal (line, time) {

		if (circleX  >= line.x1) {
			circleX = line.x1 + circleRadius + 1;		
		} else if (circleX <= line.x1) {
			circleX = line.x1 - circleRadius - 1;		
		}
		circleY+= circleVel.y*time;
		circleVel.x = -circleVel.x;
	}

	function collisionResponseLineVertical (line, time) {
		//y coord
		if (circleY  >= line.y1) {
			circleY = line.y1 + circleRadius + 1;		
		} else if (circleY <= line.y1) {
			circleY = line.y1 - circleRadius - 1;		
		}
		circleX+= circleVel.x*time;
		circleVel.y = -circleVel.y;
	}

//Messed up because the wrong line is being compared to
	function collisionResponsePoint (point, time) {
		console.log ("point collision");
		circleX += circleVel.x * time
		circleY += circleVel.y * time
		var collisionVector = {
			x : circleX - point.x,
			y : circleY - point.y
		}
		var dot = circleVel.x * collisionVector.x + circleVel.y * collisionVector.y;
		var det = circleVel.x * collisionVector.y - circleVel.y * collisionVector.x;
		var angle = Math.atan2(det, dot);

		var angleInDegrees = angle * (180 / Math.PI);
		console.log (collisionVector);
		console.log ({x : circleVel.x, y : circleVel.y});
		console.log (angleInDegrees);
		//angle is always < Math.PI, so rotationAngle > 0
		var rotationAngle = -(Math.PI - 2*angle)
		var cosAngle = Math.cos (rotationAngle);
		var sinAngle = Math.sin (rotationAngle);
		//Rotate the velocity vector
		/*
			CCW rotation matrix
			R (theta) =	[cos (theta)  -sin(theta)]
						[sin (theta)  cos(theta)]
		*/
		var newVelX = circleVel.x * cosAngle - circleVel.y * sinAngle;
		var newVelY = circleVel.x * sinAngle + circleVel.y * cosAngle;

		circleVel.x = newVelX;
		circleVel.y = newVelY;

		console.log ("new velocities");
		console.log (newVelX);
		console.log (newVelY);
		/*
		var vector1String = "(" + circleVel.x + ", " + circleVel.y + ")";
		var vector2String = "(" + collisionVector.x + ", " + collisionVector.y + ")";
		console.log (vector1String + " " + vector2String + " " + angle);
		*/
	}

	function scalarMultipleOfVector (vector, point1, point2) {
		//Assert point2 - point1 = vector
		var pointDiff = {
			x : point2.x - point1.x,
			y : point2.y - point1.y
		}

		return ((vector.x * pointDiff.x) + (vector.y * pointDiff.y)) / (vector.x * vector.x + vector.y * vector.y);
	}

	function printAngle (vector1, vector2) {
		var dot = vector1.x * vector2.x + vector1.y * vector2.y;
		var det = vector1.x * vector2.y - vector1.y * vector2.x;
		var angle = Math.atan2(det, dot);

		angle = angle * (180 / Math.PI);
		var vector1String = "(" + vector1.x + ", " + vector1.y + ")";
		var vector2String = "(" + vector2.x + ", " + vector2.y + ")";
		console.log (vector1String + " " + vector2String + " " + angle);
	}

	var points = [];
	var lines = []

	function setCirclePos (event) {
		circleX = event.clientX;
		circleY = event.clientY - 100;
	}

	//Note: remember to resize everything when the display size changes
	function init(){
		
		var mainContent = document.getElementById('main-body');
		mainContent.style.borderStyle = "none";

		var c = document.getElementById("myCanvas");
		c.onclick = setCirclePos;

		var c = document.getElementById("myCanvas");
		c.width = 500;
		c.height = 500;
		var ctx = c.getContext("2d");
		var width = ctx.canvas.width
		var height = ctx.canvas.height;
	lines = [
	{x1 : 5, y1 : 0, x2 : 5, y2 : height},
	{x1 : 0, y1 : 5, x2 : width, y2 : 5},
	{x1 : width - 5, y1 : 0, x2 : width - 5, y2 : height},
	{x1 : 0, y1 : height - 5, x2 : width, y2 : height - 5},
	];

	points = [
	{x : 100, y : 100}
	];
		console.log ("init header")

		printAngle ({x : 1, y : 1}, {x : 1, y : 0});
		printAngle ({x : -1, y : 1}, {x : 1, y : 0});
		printAngle ({x : -1, y : -1}, {x : 1, y : 0});
		printAngle ({x : 1, y : -1}, {x : 1, y : 0});

		printAngle ({x : -1, y : -1}, {x : 1, y : 1});
		printAngle ({x : 1, y : 1}, {x : -1, y : -1});

		printAngle ({x : 1, y : 1}, {x : -1, y : 0});
	}



	window.Window = {
		init : init,
		startAnimation : startAnimation,
		animation : animation
	}

	function pauseAnimation(event) {
		console.log ("pressed key");
		clearInterval (animation);
	}

	document.onkeydown = pauseAnimation;
})(window,document);

function pauseAnimation (event) {
	clearInterval (Window.animation);
}

Window.init();
Window.startAnimation();
