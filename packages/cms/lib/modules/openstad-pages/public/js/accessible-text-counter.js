$(document).ready(function () {
  $('input[minlength], input[maxlength], textarea[minlength], textarea[maxlength]').on('input', handleChangesForInputsWithLength);
});

function handleChangesForInputsWithLength () {
    var min     = parseInt($(this).attr('minlength'));
    var max     = parseInt($(this).attr('maxlength'));
    var current = $(this).val().length;
    var id      = $(this).attr('id') || undefined;
    
    if (min && current < min && current % 10 == 0) {
      var remaining = min - current;
      addScreenReaderAlert(current + ' tekens gebruikt. Nog ' + remaining + ' tekens te gaan voordat het minimum van ' + min + ' tekens bereikt is.', id);
    } else if (min && current == min) {
      if (max) {
        var remaining = max - current;
        addScreenReaderAlert('Minimum aantal tekens van ' + current + ' bereikt. Nog ' + remaining + ' tekens te gaan voordat het maximum van ' + max + ' tekens bereikt is.', id);
      } else {
        addScreenReaderAlert('Minimum aantal tekens van ' + current + ' bereikt.', id);
      }
    } else if (max && current < max && current % 10 == 0) {
      var remaining = max - current;
      addScreenReaderAlert(current + ' tekens gebruikt. Nog ' + remaining + ' tekens te gaan voordat het maximum van ' + max + ' tekens bereikt is.', id);
    } else if (max && current == max) {
      addScreenReaderAlert('Maxmimum aantal tekens van ' + max + ' bereikt.', id);
    } else if (max && current > max) {
      var remaining = max - current;
      addScreenReaderAlert(current + ' tekens gebruikt. Het maximum aantal tekens is ' + max + '. Haal minimaal ' + remaining + ' tekens weg om verder gaan.', id);
    }
}

function addScreenReaderAlert(message, elementId) {
  // Remove the current alerts, so we don't end up with a screen reader that is stuck in a long list of alerts
  var currentAlerts = document.querySelectorAll('.sr-alert');
  
  if (currentAlerts) {
    for (var i = 0; i < currentAlerts.length; i++) {
      currentAlerts[i].parentNode.removeChild(currentAlerts[i]);
    }
  }
  
  var div = document.createElement('div');
  div.setAttribute('role', 'alert');
  div.setAttribute('aria-live', 'polite');
  
  if (typeof elementId !== 'undefined' && elementId) {
    div.setAttribute('aria-describedby', elementId);
  }
  
  div.className = 'sr-only sr-alert';
  div.innerHTML = message;
  
  document.body.appendChild(div);
}
