// tab selector functions
var activeTab = getCookie('plannenActiveTab') || 0;
var activeFilter = getCookie('plannenActiveFilter') || 0;
var activeHelp = getCookie('plannenActiveHelp') || 0;
(function() {
  activateIdeaOverviewTab(activeTab)
  activateIdeaOverviewFilter(activeFilter)
  activateIdeaOverviewHelp(activeHelp)
})();

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function activateIdeaOverviewTab(which) {
  activeTab = which;
  document.cookie = 'plannenActiveTab=' + activeTab + "; SameSite=Strict";

  var themaSelectorEl = document.getElementById('themaSelector');

  if (which > 0) {
    $(themaSelectorEl).addClass('active');
  } else {
    $(themaSelectorEl).removeClass('active');
  }


  if (themaSelectorEl) {
    themaSelectorEl.selectedIndex = activeTab;
    if (themaSelectorEl.selectedIndex === 0) {
      themaSelectorEl.options[0].innerHTML = 'Thema\'s';
    } else {
      themaSelectorEl.options[0].innerHTML = 'Alle thema\'s';
    }
  }

  updateIdeaOverviewDisplay();

  $(document).trigger('sortIdeas');
}

function activateIdeaOverviewFilter(which) {
  activeFilter = which;
  document.cookie = 'plannenActiveFilter=' + activeFilter + "; SameSite=Strict";

  var filterSelectorEl = document.getElementById('filterSelector');

  if (which > 0) {
    $(filterSelectorEl).addClass('active');
  } else {
    $(filterSelectorEl).removeClass('active');
  }

  if (filterSelectorEl) {
    filterSelectorEl.selectedIndex = activeFilter;
    if (filterSelectorEl.selectedIndex === 0) {
      filterSelectorEl.options[0].innerHTML = 'Wijk';
    } else {
      filterSelectorEl.options[0].innerHTML = 'Alle wijken';
    }
  }

  updateIdeaOverviewDisplay();

  $(document).trigger('sortIdeas');
}

function activateIdeaOverviewHelp(which) {
  activeTab = which;
  document.cookie = 'plannenActiveHelp=' + activeTab + "; SameSite=Strict";

  var helpSelectorEl = document.getElementById('helpSelector');

  if (which > 0) {
    $(helpSelectorEl).addClass('active');
  } else {
    $(helpSelectorEl).removeClass('active');
  }


  if (helpSelectorEl) {
    helpSelectorEl.selectedIndex = activeTab;
    if (helpSelectorEl.selectedIndex === 0) {
      helpSelectorEl.options[0].innerHTML = 'Hulpvragen';
    } else {
      helpSelectorEl.options[0].innerHTML = 'Alle hulpvragen';
    }
  }

  updateIdeaOverviewDisplay();

  $(document).trigger('sortIdeas');
}

function deactivateIdeaOverviewAll() {
  activateIdeaOverviewTab(0)
  activateIdeaOverviewFilter(0)
  activateIdeaOverviewHelp(0)
}

function updateIdeaOverviewDisplay() {
  var activeTab = document.getElementById('themaSelector');
  var activeFilter = document.getElementById('filterSelector');
  var activeHelp = document.getElementById('helpSelector');

  var activeThema = activeTab ? activeTab.value : '';
  var activeGebied = activeFilter ? activeFilter.value : '';
  var activeHelp = activeHelp ? activeHelp.value : '';

  var elements = document.getElementsByClassName('idea-item');

  $(document).trigger('updateIdeaOverviewDisplay');

  Array.prototype.forEach.call(elements, function(element) {
    
    var elementThema = Array.from(element.querySelectorAll('.thema')).map((thema) => { return thema.innerHTML});
    var elementGebied = Array.from(element.querySelectorAll('.gebied')).map((gebied) => { return gebied.innerHTML});
    var elementHelp = Array.from(element.querySelectorAll('.help')).map((help) => { return help.innerHTML});
    
    if (!elementThema ) {
      element.style.display = 'inline-block';
    }

    if (
      // no activeTab selected or
      (( !activeThema || activeThema == 0 ) || elementThema.includes(activeThema))
      &&
      // active Filter selected
      (( !activeGebied || activeGebied == 0 ) || elementGebied.includes(activeGebied))
      &&
      // active Filter selected
      (( !activeHelp || activeHelp == 0 ) || elementHelp.includes(activeHelp))
    ) {
      element.style.display = 'inline-block';
    } else {
      element.style.display = 'none';
    }
  });

}
