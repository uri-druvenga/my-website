// Makes my name look cool on the hero image
// Code by Uri Druvenga

(function() {

// Get canvas info
const canvas = document.querySelector("#name-canvas"),
	ctx = canvas.getContext("2d", {willReadFrequently: true} ),
	fontConstant = 650 / 75,
	fontStyle = '"Zalando Sans Expanded", Arial';

// Configurable data
var filterData = {
		xShift: {
			maxHeight: 20,
			magnitude: 50,
			chance: 0.25
		},
		rgb3d: {
			magnitude: 5,
			colors: ["red", "blue"],
			chance: 0.33
		},
		rectOv: {
			maxWidth: 75,
			maxHeight: 30,
			widthRatio: 1.5,
			chance: 0.75,
			repeatChance: 0.66
		}
	},
	TEXT = "Uri Druvenga",
	textWidth = 0;

// ===== Filters ===== //

// Shifts a chunk of the canvas horizontally
function xShift(ctx) {
	let data = filterData.xShift,
		randY = Math.random() * canvas.height,
		randHeight = Math.random() * data.maxHeight + 5,
		randOffset = Math.random() * (data.magnitude * 2) - data.magnitude,
		imgDat = ctx.getImageData(0, randY, canvas.width, randHeight);
	
	ctx.clearRect(0, randY, canvas.width, randHeight);
	ctx.putImageData(imgDat, randOffset, randY);
}
// Causes a red/blue shading behind the text
function rgb3d(ctx) {
	let data = filterData.rgb3d,
		randMagnitude = Math.random() * (data.magnitude * 2) - data.magnitude;
	
	ctx.fillStyle = data.colors[0];
	ctx.fillText(TEXT, canvas.width / 2 + randMagnitude, canvas.height / 2);
	ctx.fillStyle = data.colors[1];
	ctx.fillText(TEXT, canvas.width / 2 - randMagnitude, canvas.height / 2);
}
// Displays "glitch" rectangles within a portion of the canvas
function rectOv(ctx) {
	let data = filterData.rectOv,
		margin = (canvas.width - textWidth) / 2;
	while(Math.random() < filterData.rectOv.repeatChance) {
		let randW = Math.random() * data.maxWidth,
			randH = Math.random() * data.maxHeight,
			randX = Math.random() * (canvas.width - margin * 2) + margin - (randW / 2),
			randY = Math.random() * (canvas.height + 25) - 25 - (randH / 2);
		
		if(randW < randH * data.widthRatio) continue;
		
		ctx.fillStyle = ["white","black"][Math.round(Math.random())];
		ctx.fillRect(randX, randY, randW, randH);
	}
}

// ===== End Filters ===== //

// Animation loop
function update() {
	// Resizes (for screen changes)
	let width = Math.min(650, innerWidth),
		height = width / 6.5,
		fontSize = width / fontConstant;
	ctx.canvas.width = width;
	ctx.canvas.height = height;
	ctx.font = `${fontSize}px ${fontStyle}`;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	
	// Measures text to find empty margin
	textWidth = ctx.measureText(TEXT).width;
	
	if (window.disableAnimations === true) {
		// The main text
		ctx.fillStyle = "white";
		ctx.fillText(TEXT, canvas.width / 2, canvas.height / 2);
	} else {

		// Clear screen
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// This filter goes behind text
		if(Math.random() < filterData.rgb3d.chance) rgb3d(ctx);
	
		// The main text
		ctx.fillStyle = "white";
		ctx.fillText(TEXT, canvas.width / 2, canvas.height / 2);
	
		// More filters
		if(Math.random() < filterData.rectOv.chance) rectOv(ctx);
	
		if(Math.random() < filterData.xShift.chance) xShift(ctx);
	}
}

// For accessibility / safety
window.disableAnimations ??= false;

// Start the loop
var updateInterval = window.setInterval(update, 100);

})();