// Handles form submission (or the lack thereof)
// Code by Uri Druvenga

(function() {

const formEl = document.querySelector("#contact-form");

formEl.addEventListener("submit", function(event) {
	event.preventDefault();

	alert("This form is currently unfinished.");
});

})();