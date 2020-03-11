(function($) {
	// Call Gridder
	$('.gridder').gridderExpander({
    scroll: true,
    scrollOffset: 100,
    scrollTo: "panel",                  // panel or listitem
    animationSpeed: 300,
    animationEasing: "easeInOutExpo",
    showNav: true,                      // Show Navigation
    nextText: "<span></span>", // Next button text
    prevText: "<span></span>", // Previous button text
    closeText: "", // Close button text                // Close button text
    onStart: function(target) {
			var isPhone = document.querySelector('body').offsetWidth < 700; // isPhone - todo: betere afvanging
			this.scrollOffset = isPhone ? -40: 100;
		},
    onContent: function(args){
			var element = args[0];
			var ideaId =  element && element.querySelector('.this-idea-id') ? element.querySelector('.this-idea-id').innerHTML : false;
			window.history.replaceState({}, '', '#ideaId-' + ideaId);

		  var fotoramaEl = $('.fotorama');

			if (fotoramaEl.length > 0) {
				 var fotorama = fotoramaEl.fotorama({
					thumbWidth: 60,
				  thumbHeight: 60,
					minWidth: 300,
					keyboard: false
				});

			  fotorama.on('fotorama:fullscreenenter fotorama:fullscreenexit', function (e, fotorama) {
			      if (e.type === 'fotorama:fullscreenenter') {
			          // Options for the fullscreen
			          fotorama.setOptions({
			              fit: 'contain'
			          });
			      } else {
			          // Back to normal settings
			          fotorama.setOptions({
			              fit: 'cover'
			          });
			      }
					});
			}

      imageModal(element);
      initOpenlayersMap(element);

			return false;
		},
    onClosed: function(){
			window.history.replaceState({}, '', '#');
		}
  });
})(jQuery);

var currentOverlay;
function ideaListClick(event) {
	// search for the element clicked
  var target = event.target;
	var mouseOverLayer;
	var ideaElement;
	var button;


  while ( target.tagName != 'HTML' ) {
    if ( target.className.match(/gridder-mouse-over|info/) ) {
      mouseOverLayer = target;
    }
    if ( target.className.match(/button-more-info|button-vote/) ) {
      button = target;
    }
    if ( target.className.match('gridder-list') ) {
      ideaElement = target;
      break;
    }
    target = target.parentNode || target.parentElement;
  }

	var isPhone = document.querySelector('body').offsetWidth < 700; // isPhone - todo: betere afvanging
	// on phone first click shows moseover, second acually shows something
	if (isPhone && mouseOverLayer) {
		if (mouseOverLayer.className.match(/ showFirst/)) {
			mouseOverLayer.className = mouseOverLayer.className.replace(' showFirst', '');
			mouseOverLayer.style.display = 'none';
		} else {
			mouseOverLayer.className += ' showFirst';
			event.stopPropagation()
			event.stopImmediatePropagation()
			return;
		}
	}

  if ( ideaElement && button ) {

		// if button == 'more info' use gridder
		// if (button.className == 'button-more-info') {
		//  	return;
		// }

		// if button == 'stem'
		if (button.className == 'button-vote') {
			var match = ideaElement.id.match(/idea-(\d+)/)

			if (match) {
				// TODO: wat je hier moet doen moet niet hardcoded zijn
		//		selectIdea(match[1])

				// cancel gridder
				if (mouseOverLayer) {
					event.stopPropagation()
					event.stopImmediatePropagation()
				}

			}
		}

	}

	// cancel gridder
	// if (mouseOverLayer) {
	//  	event.stopPropagation()
	//  	event.stopImmediatePropagation()
	// }

}

function scrollToIdeas() {
  scrollToResolver(document.getElementById('ideas-anchor'));
}

function scrollToResolver(elem) {
	if (elem) {
	  var jump = parseInt(elem.getBoundingClientRect().top * .2);
	  document.body.scrollTop += jump;
	  document.documentElement.scrollTop += jump;
	  if (!elem.lastjump || elem.lastjump > Math.abs(jump)) {
	    elem.lastjump = Math.abs(jump);
	    setTimeout(function() { scrollToResolver(elem);}, 25);
	  } else {
	    elem.lastjump = null;
	  }
	}
}

function setMapHeight(element, nlmapsHolder) {
  var image = element.querySelector(".idea-image-mask .idea-image");
  nlmapsHolder.style.height = image.offsetHeight + "px";
}

function imageModal(element) {
  var modal = document.getElementById("imageModal");
  var modalImg = document.getElementById("img01");
  var modalImage = element.querySelector(".idea-image-mask .idea-image");
  var captionText = document.getElementById("caption");
  var ideaElement = $(element).prev('li.selectedItem').get(0);

  var imageUrl = modalImage.style['background-image'].match(/\((.*?)\)/)[1].replace(/('|")/g,'');
  modalImage.addEventListener("click",function(e){
    modal.style.display = "block";
    modalImg.src = imageUrl.substring(0, imageUrl.indexOf('/:'));
    captionText.innerHTML = ideaElement.title;
  });
}

function initOpenlayersMap(element) {
	var ideaElement = $(element).prev('li.selectedItem').get(0);
  // init openlayers
  if (ideaElement && ideaElement.ideaId) {
    var ideaId = ideaElement.ideaId;

    var location = ideaElement.dataset.location.split(',');
		var nlmapsHolder = $('.gridder-show #nlmaps-idea-holder-' + ideaId);
		apos.modules['map-widgets'].createSingleIdeaMap(nlmapsHolder[0], location, ideaElement.status);
    setMapHeight(element, nlmapsHolder.get(0));
  }
}
