// Controls the constellation background
// Code by Uri Druvenga

(function() {
	
// Configuration
var CustomUpdate = function() {/*Only edit this if you know what you are doing!*/},
	PointData = {// Interacting points
		connectionLength: 100,// Max length of connecting points
		avExpiryLength: 2500,// The average lifespan (in ms)
		expiryRange: 50,// Variability of lifespan, in percent
		fadeTime: 1000,// Time spent during the fading life
		randSizeMax: 3,// The maximum size and minimum sizes of points.
		randSizeMin: 0.1,// Works as random[0, max) + min
		randVelMax: 0.1// Maximum speed a point can move at
	},
	ColorData = {// Hsl data
		hsl: [0, 0, 100],// hsl points
		endPointDiff: 0,// The variability points have in their hue
		hslDegShift: 0,// The degrees the points shift each Update
		hslStartShift: 0,// The lower boundary of the gradient
		hslEndShift: 0,// The upper boundary
		hslDegDirection: 1// No touchy
	},
	SpawnData = {// Spawning points
		lastCreatedPoint: 0,// No touchy
		delay: 25,// Delay between points created (in ms)
		frequency: 50,// Percent chance to create a point
		maxPoints: 500,// Max points allowed at a time
		updateTime: 5// Update time (in ms)
	};

const StringReplace = function(string, replacers) {
		for(let index in replacers) string = string.replace(new RegExp(`\\$${index}`, "g"), replacers[index]);
		return string;
	},
	Points = [],// All live points
	Point = class {// Baby point
		constructor(x, y, vel=null, data={}) {
			vel ??= PointData.randVelMax;
			[this.x, this.y] = [x, y];// Coordinates
			this.birth = Number(new Date());// Lifespan data
			this.life = 0;// 0 = fade in, 1 = alive, 2 = fade out
			this.light = 0;// Lightness, in percent
			this.connections = [];// Friends
			this.lastUpdate = new Date();// Delta time my beloved
			this.hue = data.hue ?? ColorData.hsl[0] + (Math.random() * ColorData.endPointDiff);// HSL hue
			this.size = data.size ?? Math.random() * (PointData.randSizeMax - PointData.randSizeMin) + PointData.randSizeMin;// size
			this.expiryLength = data.expiry ?? PointData.avExpiryLength * (Math.random() / 2 + PointData.expiryRange / 100);// Lifespan
			this.velocity = Array.isArray(vel) ?// Velocity
				vel :
				[(Math.random() - 0.5) * vel, (Math.random() - 0.5) * vel];
			
			// Add to the list
			Points.push(this);
		}
		
		// Return other points within a distance of PointData.connectionLength
		NearbyPoints() {
			return Points.filter((function(point) {
				return point != this &&
					Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2)) <= PointData.connectionLength;
			}).bind(this));
		}
		
		// Be alive
		Update() {
			// Get delta time
			let dt = new Date() - this.lastUpdate;
			this.lastUpdate = new Date();
			
			// Aging
			// A point has three phases: birth, life, and dying.
			let date = Number(new Date());
			if(this.life == 0 && date > this.birth + PointData.fadeTime) {// Finish "birth" phase
				this.life = 1;
				this.birth = Number(new Date());
			} else if(this.life == 1 && date > this.birth + this.expiryLength) {// Finish "life" phase
				this.life = 2;
				this.birth = Number(new Date());
			} else if(this.life == 2 && date > this.birth + PointData.fadeTime) return Points.splice(Points.indexOf(this), 1); // Die
			
			// Move
			this.x += this.velocity[0] * dt / 10;
			this.y += this.velocity[1] * dt / 10;
			
			// Manipulate lightness based on lifespan / birthtime
			this.light = (this.life == 0 ?
				Math.min(1, (date - this.birth) / PointData.fadeTime) :
				(this.life == 2 ?
					1 - Math.min(1, (date - this.birth) / PointData.fadeTime) :
					1
				)) * 100;
			
			// Form connections
			this.connections = this.NearbyPoints();
		}
	},
	Draw = {// Data/functions for canvas
		ctx: null,// Canvas context
		background: "#0a0a0a",
		Color: {// Color conversion
			RGBToHSL: function(r, g, b) {
				r /= 255;
				g /= 255;
				b /= 255;
				let max = Math.max(r, g, b),
					min = Math.min(r, g, b),
					h, s, l = (max + min) / 2;
				if(max == min) h = s = 0;
				else {
					let diff = max - min;
					s = l > 0.5 ?
						diff / (2 - max - min) :
						diff / (max + min);
					switch(max) {
						case r:
							h = (g - b) / diff + (g < b ? 6 : 0);
							break;
						case g:
							h = (b - r) / diff + 2;
							break;
						case b:
							h = (r - g) / diff + 4;
							break;
					}
					h /= 6;
				}
				return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
			},
			HSLToRGB: function(h, s, l) {
				h /= 360;
				s /= 100;
				l /= 100;
				let r, g, b;
				if(s == 0) r = g = b = l;
				else {
					function HueToRGB(p, q, t) {
						if(t < 0) t += 1;
						else if(t > 1) t -= 1;
						if(t < 1/6) return p + (q - p) * 6 * t;
						else if(t < 1/2) return q;
						else if(t < 2/3) return p + (q - p) * 6 * (2/3 - t);
						return p;
					}
					let q = l < 0.5 ?
							l * (1 + s) :
							l + s - l * s,
						p = 2 * l - q;
					r = HueToRGB(p, q, h + 1/3);
					g = HueToRGB(p, q, h);
					b = HueToRGB(p, q, h - 1/3);
				}
				return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
			},
			RGBToHex: function(r, g, b) {
				return "#" +
					`00${r.toString(16)}`.slice(-2) +
					`00${g.toString(16)}`.slice(-2) +
					`00${b.toString(16)}`.slice(-2);
			},
			HexToRGB: function(hex) {
				hex = hex.slice(1).match(/.{1,2}/g);
				return hex.map(str => parseInt(str, 16));
			}
		},
		Line: function(x1, y1, x2, y2, c, w=3) {// Draw a line from (x1, y1) to (x2, y2), width w, color c
			let ctx = Draw.ctx;
			ctx.strokeStyle = c;
			ctx.lineWidth = w;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			ctx.closePath();
		},
		Circle: function(x, y, r, c) {// Draw a circle at (x, y) of radius r, color c
			let ctx = Draw.ctx;
			ctx.fillStyle = c;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
		},
		Background: function(c=null) {// Set the background
			if(c != null) Draw.background = c;
			let ctx = Draw.ctx,
				canvas = ctx.canvas;
			ctx.fillStyle = Draw.background;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		},
		shouldDraw: true
	},
	DrawPoints = function() {// Draw all points
		let date = new Date(),
			sat = ColorData.hsl[1],
			light = ColorData.hsl[2];
		
		Draw.Background();
		
		for(let point of Points) {// Draw lines
			for(let other of point.connections) {// Draw connect lines
				let dist = Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.x - other.x, 2)),// Distance
					fadeDist = PointData.connectionLength / 2;// Point where lines fade
				
				Draw.ctx.globalAlpha = Math.min(point.light, other.light) / 100;// Fade lines
				
				Draw.Line(
					point.x, point.y,
					other.x, other.y,
					`hsl(${Math.floor((point.hue + other.hue) / 2)},${sat}%,${light}%)`,
					Math.min(point.size, other.size) * 0.66
				);
			}
		}
		
		// Draw points seperately so they aren't impeded by darker lines
		for(let point of Points) {
			Draw.ctx.globalAlpha = point.light / 100;
			Draw.Circle(
				point.x, point.y,
				point.size,
				`hsl(${Math.floor(point.hue)},${sat}%,${light}%)`
			);
		}
	},
	Update = function() {// The legend
		setTimeout(Update, SpawnData.updateTime);
		if(window.disableAnimations === true) return;
		
		if(!Draw.ctx) return "Draw.ctx undefined!";
		
		let canvas = Draw.ctx.canvas,
			hueDir = ColorData.hslDegDirection,
			date = +(new Date());
		
		// Spawn delay has passed
		if(date > SpawnData.lastCreatedPoint + SpawnData.delay) {
			SpawnData.lastCreatedPoint = date;
			if(
				Points.length < SpawnData.maxPoints &&
				Math.random() > (1 - SpawnData.frequency / 100)
			) new Point(Math.random() * innerWidth * 1.1 - 20, Math.random() * innerHeight * 1.1 - 20);
		}
		
		// Shift hues (if enabled)
		ColorData.hsl[0] += ColorData.hslDegShift * hueDir;
		let hue = ColorData.hsl[0];
		
		if(// Switch hue direction
			ColorData.hslStartShift != ColorData.hslEndShift &&
			(hue >= ColorData.hslEndShift || hue <= ColorData.hslStartShift)
		) ColorData.hslDegDirection = hueDir * -1;
		
		// Update living points
		for(let point of Points) {
			point.Update();
			point.hue += ColorData.hslDegShift * hueDir;
		}
		
		canvas.width = innerWidth;
		canvas.height = innerHeight;
		CustomUpdate();// Handle user-set JS
		
		if(Draw.shouldDraw) DrawPoints();// Shapes be shapey
	};

// Accessibility / safety
window.disableAnimations ??= false;
	
Draw.ctx = document.querySelector("#constellation-canvas").getContext("2d");
	
Update();

})();