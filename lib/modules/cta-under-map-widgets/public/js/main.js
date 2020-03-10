$(document).ready(function () {
  $('.item.view-all-plans').on('click', function (e) {
    e.preventDefault();
    
    var offset = $('#idea-overview-container').offset().top;
    
    $('html, body').animate({scrollTop: offset - 150}, 500);
    
    console.log (offset);
  });
});
