(function($) {
//  $('.mobile-accordion-header, .mobile-accordion-header:hidden').on('click', function (ev) {
  $(document.body).on('click', '.mobile-accordion-header', function (ev) {
    ev.preventDefault();
    var $mobileAccordion = $(this).closest('.mobile-accordion');
    $mobileAccordion.toggleClass('open');
    
    var $mobileAccordionBody = $mobileAccordion.find('.mobile-accordion-body');
    $mobileAccordionBody.attr('aria-expanded', $mobileAccordionBody.attr('aria-expanded') == 'true' ? 'false' : 'true');
  });
})(jQuery);
