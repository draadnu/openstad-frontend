$(document).ready(function () {
  var $dateBar;
  var endDate;
  var endDateText;
  var daysLeft1;
  var value000;
  var value00;
  var value0;

  $('.date-bar').each(function() {
      $dateBar = $(this);
      endDate = new Date($dateBar.attr('data-date'));

      daysLeft1 = parseInt( ( endDate.getTime() - Date.now() ) / ( 24 * 60 * 60 * 1000) ) + 1;


      if ( daysLeft1 > 0 ) {
        endDateText = $dateBar.attr('data-before-date');

       $dateBar.find('.end-date-bar-start-text-1').html(endDateText);
       $dateBar.find('.end-date-bar-end-text-1').html('dagen');

       //format the day count
       var days = daysLeft1.toString();
       
       if (days.length < 3) {
         value000 = 0;
       } else {
         value000 = days.substr(-3, 1);
       }
       
       if (days.length < 2) {
         value00 = 0;
       } else {
         value00 = days.substr(-2, 1);
       }
       
       if (days.length < 1) {
         value00= 0;
       } else {
         value0 = days.substr(-1, 1);
       }
       
       if (value000) {
         $dateBar.find('.end-date-number-plate-000-1').html(value000).removeClass('hidden');
       } else {
         $dateBar.find('.end-date-number-plate-000-1').html(value000).addClass('hidden');
       }
       
       $dateBar.find('.end-date-number-plate-00-1').html(value00);
       $dateBar.find('.end-date-number-plate-0-1').html(value0);
      } else {
        endDateText = $dateBar.attr('data-after-date');

       $dateBar.find('.end-date-bar-start-text-1').html( endDateText);
       $dateBar.find('.end-date-bar-end-text-1').html('dagen');
       $dateBar.find('.end-date-number-plate-000-1').html(0).addClass('hidden');
       $dateBar.find('.end-date-number-plate-00-1').html(0);
       $dateBar.find('.end-date-number-plate-0-1').html(0);
      }


  })
});
