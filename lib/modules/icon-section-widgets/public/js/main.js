apos.define('icon-section-widgets', {
  extend: 'apostrophe-widgets',
  construct: function (self, options) {
    self.play = function ($widget, data, options) {
      $widget.find('.howDoesItWorkButton').click(function(event) {
        event.preventDefault();
        var howDoesItWork = $widget.find('.howDoesItWork');

        var isOpen = howDoesItWork.hasClass('open');
        howDoesItWork.removeClass(isOpen ? 'open' : 'closed');
        howDoesItWork.addClass(isOpen ? 'closed' : 'open');

      })
    }
  }
});
