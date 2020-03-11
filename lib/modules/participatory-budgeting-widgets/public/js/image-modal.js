// Get the <span> element that closes the modal
var modal = document.getElementById("imageModal");
var span = document.getElementsByClassName("modal-close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function(event) {
  closeModal(event);
}
modal.onclick = function(event) {
  closeModal(event);
}

function closeModal(event) {
  if($(event.target).hasClass('modal-content') )
  {
    return;
  }
  modal.style.display = "none";
}
