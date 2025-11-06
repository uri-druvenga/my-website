// Places the easter egg character in the footer
// Code by Uri Druvenga

(function() {

const options = ["asgore", "flowey", "mettaton", "papyrus", "sans", "toriel", "undyne"],
	rareSnd = "megalovania",
	targetImg = document.querySelector("#secret-img"),
	defaultFiletypes = {
		"images": ".png",
		"audio": ".mp3"
	};
var audio = new Audio(),
	secretAudio = new Audio(),
	randomChara = null;

// Works for relative filepaths as a .html file
const isIndex = ["", "index.html"].includes(
	location.href.split("/").at(-1)
);

// Gets the path an asset is found at
function getAssetPath(name, type) {
	return `${isIndex ? "" : "../"}assets/${type}/${name}${defaultFiletypes[type] ?? ""}`;
}

// Attempts to restart / play audio
function startAudio() {
	if(randomChara === "null") return;

	let isPlaying = !(audio.paused && secretAudio.paused);
	if(isPlaying) {
		audio.pause();
		audio.currentTime = 0;
		secretAudio.pause();
		secretAudio.currentTime = 0;
	} else {
		if(Math.random() > 0.1) audio.play();
		else secretAudio.play();
	}
}

// Selects a chara to show
function init() {
	randomChara = options[Math.floor(Math.random() * options.length)];

	targetImg.src = getAssetPath(randomChara, "images");
	audio.src = getAssetPath(randomChara, "audio");
	secretAudio.src = getAssetPath(rareSnd, "audio");
}

targetImg.addEventListener("click", startAudio);

init();

})();