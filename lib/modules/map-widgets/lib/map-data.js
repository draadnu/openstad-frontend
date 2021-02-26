'use sctrict';

const getIconUrl = function(status, theme, themes) {
    // Todo: refactor this check
    const flagUrl = getFlagUrlByTheme(theme, themes);

    if (flagUrl) {
      return flagUrl;
    }

    const flag = getFlagByTheme(theme, themes);
    if (flag) {
      return getMarkerUrlBasedOnTheme(status, flag);
    }

    if(status == 'DONE'  || status == 'ACCEPTED' || status == 'BUSY') {
        return '/img/idea/flag-blue.png';
    } else if ( status == 'CLOSED'  || status == 'DENIED') {
        return '/img/idea/flag-gray.png';
    } else {
        return '/img/idea/flag-red.png';
    }
}

const getFlagUrlByTheme = function (currentTheme, themes) {
  var flagUrl = false;

  if (themes && themes.length > 0) {
      var selectedTheme = themes.filter(function (theme) {
          // todo: Can we match this in another way besides theme name?
          return theme.value == currentTheme;
      });

      if (selectedTheme && selectedTheme.length == 1) {
        flagUrl = selectedTheme[0].mapUploadedFlagUrl ? selectedTheme[0].mapUploadedFlagUrl : false;
      }
  }

  return flagUrl;
}

const getIconSize = function (currentTheme, themes) {
  var sizeArray = [22, 24];

  if (themes && themes.length > 0) {
      var selectedTheme = themes.filter(function (theme) {
          // todo: Can we match this in another way besides theme name?
          return theme.value == currentTheme;
      });
      if (selectedTheme && selectedTheme.length == 1) {
        sizeArray[0] = selectedTheme[0].mapFlagWidth ? parseInt(selectedTheme[0].mapFlagWidth, 10) : sizeArray[0];
        sizeArray[1] = selectedTheme[0].mapFlagHeight ?parseInt(selectedTheme[0].mapFlagHeight, 10) : sizeArray[1];
      }
  }

   return sizeArray;
}

const getFlagByTheme = function(currentTheme, themes) {
    if (themes && themes.length > 0) {
        var selectedTheme = themes.filter(function (theme) {
            // todo: Can we match this in another way besides theme name?
            return theme.value == currentTheme;
        });
        if (selectedTheme && selectedTheme.length == 1) {
            return selectedTheme[0].flag;
        }
    }

    return null;
}
const getMarkerUrlBasedOnTheme = function(idea, flag) {
    if (idea.status == 'CLOSED' || idea.status == 'DENIED') {
        return '/img/idea/flag-gray.svg';
    }

    return'/img/idea/flag-' + flag + '.png';
}

function getHref(ideaSlug, id) {
    var ids = [2767, 2772, 2773, 2774, 2776, 2790, 2927, 2919, 2918, 2914, 2906, 2905, 2904, 2898, 2897, 2896, 2889, 2881, 2877, 3625,3628,3630,3642,3643,3645,3646,3648,3651,3657,3658,3659,3660,3820,3821,3579,3580,3585,3588,3589,3590,3592,3594,4026,4031,3960,3928,3964,3979,3931,3968,4033,3942,4037,3992,3982,3963,3995,4035,4022];
    
    if (ids.indexOf(id) != -1) {
        return '#ideaId-' + id;
    }
    
    return '/' + ideaSlug + '/' + id;
}

// Todo: refactor this method
function deleteOldMarkers(markers) {
    // delete old markers when there are too many
    var selectedMarkers = [];
    if (markers.length > 20) {
        markers.forEach(function(marker) {
            var select = true;
            if (marker.status ==  'CLOSED') {
                var datediff = new Date().getTime() - new Date(marker.endDate).getTime();
                if ( datediff > 1000 * 60 * 60 * 24 * 90 ) {
                    select = false;
                }
            }
            selectedMarkers.push(marker);
        });
    } else {
        selectedMarkers = markers
    }

    return selectedMarkers;
}

function Marker(coordinates, status, url, endDate, theme, themes) {
    
    var anchor = [4, 21];
    
    var iconUrl = getIconUrl(status, theme, themes);
    
    // Set different anchor for Bloemenbuurt
    if (iconUrl == '/uploads/attachments/ckiheda0101dttuinrnjd27fy-webp-net-resizeimage-2.full.png') {
        anchor = [11, 26];
    }
    
    this.position = { lat: coordinates[0], lng: coordinates[1] };
    this.icon = {
        url: iconUrl,
        size: getIconSize(theme, themes),
        anchor: anchor,
    };
    this.href = url;
    this.status = status;
    this.endDate = endDate;
    this.name = 'marker';
    this.category = theme;
}

module.exports = class MapConfigBuilder {
    constructor(globalData) {
        this.globalData = globalData;
        this.config = {
            defaultSettings: null,
            markers: null,
            polygon: null,
            markerStyles: null,
            editorMarker: null,
            editorMarkerElement: null
        };
    }

    getConfig() {
        return this.config;
    }

    setDefaultSettings(settings) {
        this.config.defaultSettings = {
            center: (settings.mapCenterLat && settings.mapCenterLng) ? {lat: settings.mapCenterLat, lng: settings.mapCenterLng} : null,
            zoom: settings.mapZoomLevel || 13,
            zoomControl: settings.zoomControl || true,
            minZoom: settings.minZoom || 12,
            maxZoom: settings.maxZoom || 17,
            disableDefaultUI: settings.disableDefaultUI || true,
            styles: settings.styles || null,
            googleMapsApiKey: settings.googleMapsApiKey || ''
        };

        return this;
    }
    setPolygon(polygon) {
        this.config.polygon = polygon;
        return this;
    }
    setMarker() {
        return this;
    }
    setMarkersByIdeas(ideas) {
        const markers = [];
        ideas ? ideas.forEach((idea) => {

          if (idea.location && idea.location.coordinates) {
                markers.push(
                  new Marker(idea.location.coordinates, idea.status, getHref(this.globalData.ideaSlug, idea.id), idea.endDate, idea.extraData.theme, this.globalData.themes)
                );
          }
        }) : [];

        this.config.markers = deleteOldMarkers(markers);

        return this;
    }
    setEditorMarker() {
        // Bloemenbuurt alternative marker
        if (this.globalData && this.globalData.siteId && this.globalData.siteId == 45) {
            this.config.editorMarker = {
                icon     : {
                    url    : '/img/idea/flag-blue-gift.png',
                    size   : [22, 26],
                    anchor : [ 11, 26],
                }
            }
        } else {
            this.config.editorMarker = {
                icon     : {
                    url    : '/img/idea/flag-red.png',
                    size   : [22, 24],
                    anchor : [ 4, 21],
                }
            }
        }
        
        return this;
    }
    setEditorMarkerElement(name) {
        this.config.editorMarkerElement = name;

        return this;
    }
    setMarkerStyle(styles) {
        this.config.markerStyles = styles;

        return this;
    }
}
