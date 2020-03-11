// Get the <span> element that closes the modal
var modal = document.getElementById("imageModal");
var span = document.getElementsByClassName("modal-close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
