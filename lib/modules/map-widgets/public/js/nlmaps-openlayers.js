apos.define('map-widgets', {

    extend: 'apostrophe-widgets',

    afterConstruct: function(self) {

        // Declare ourselves the manager for this widget type
        apos.areas.setWidgetManager(self.name, self);

    },

    construct: function(self, options) {

        self.createMap = function(mapConfig) {
            var map = OpenlayersMap.createMap(mapConfig.defaultSettings);
            OpenlayersMap.setDefaultBehaviour(map);
            return map;
        };

        self.addPolygon = function(mapConfig) {
            return OpenlayersMap.addPolygon(mapConfig.polygon);
        };

        self.addMarkers = function(mapConfig) {
            return OpenlayersMap.addMarkers(mapConfig.markers);
        };

        self.setIdeaMarker = function(mapConfig) {
            return OpenlayersMap.setIdeaMarker(mapConfig.markers[0] || null);
        }

        self.addFormEventListeners = function(mapConfig) {
            OpenlayersMap.addEventListener(mapConfig.polygon, mapConfig.editorMarkerElement);
        };

        self.addOverviewEventListeners = function(map) {
            map.on('click', function (evt) {
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {

                        return feature.getProperties().href ? feature : null;
                    }, {hitTolerance: 4});

                if (feature) {
                    window.location.href = feature.getProperties().href;
                }
            });

            // change mouse cursor when over marker
            map.on('pointermove', function (e) {
                var pixel = map.getEventPixel(e.originalEvent);
                var hit                                               = map.hasFeatureAtPixel(pixel, {hitTolerance: 4});
                document.getElementById(map.getTarget()).style.cursor = hit ? 'pointer' : '';
            });

            document.addEventListener("DOMContentLoaded", function () {
                $('.ol-viewport').append($('.nlmaps-geocoder-control-container'));
            });
        };

        self.addFilterEventListeners = function(vectorSource, markers) {

            var filters = [
              {id: 'themeSelector', property: 'category'},
              {id: 'statusSelector', property: 'status'}
            ];

            function setMapMarkersFromThemeSelector(val, property) {
                vectorSource.clear();
                if (val === '0') {
                  vectorSource.addFeatures(markers);
                  return;
                }

                markers.forEach(function (feature) {
                  if (feature.getProperties()[property] === val) {
                    vectorSource.addFeature(feature);
                  }
                });
            }

            filters.forEach(function(filter) {
                var filterElement = $('#' + filter.id);
               if(filterElement.length > 0) {
                 filterElement.change(function (event) {
                   setMapMarkersFromThemeSelector(event.target.value, filter.property);
                 });

                 // Set markers based on theme selector on load
                 // This is useful when the user has selected a filter and reloads the page, this way we ensure that
                 // the marker we show line up with the ideas we show
                 setMapMarkersFromThemeSelector(filterElement.val());

                 $(document).on('updateIdeaOverviewDisplay', function () {
                   setMapMarkersFromThemeSelector(filterElement.val());
                 });
               }
            });
        }


        self.createSingleIdeaMap = function(target, location, status) {
          // Todo: use default methods
          var iconUrl = status === 'ACCEPTED' ? '/img/idea/flag-blue.png' : '/img/idea/flag-gray.png';
          var icon =  {url: iconUrl, size: [22, 24]};
          var center = [parseFloat(location[1]), parseFloat(location[0])];

          console.log(center);
          var defaultSettings = {
            view: new ol.View({
              center: ol.proj.fromLonLat(center),
              zoom:    16,
              minZoom: 16,
              maxZoom: 16
            }),
            controls: [],
            interactions: [],
            target:  target,
            search:  false
          };

          var map = new ol.Map(defaultSettings);

          var layer = nlmaps.openlayers.bgLayer();
          var overlayLayer = nlmaps.openlayers.overlayLayer('gebouwen');
          var markerLayer = nlmaps.openlayers.markerLayer(true);

          map.addLayer(layer);
          map.addLayer(overlayLayer);
          map.addLayer(markerLayer);

          var marker = new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.fromLonLat(center)
            ),
          });
          marker.setStyle(new ol.style.Style({
            image: new ol.style.Icon(({
              crossOrigin: 'anonymous',
              src: icon.url,
              anchor: [0, 0],
              size: icon.size
            }))
          }));
          var vectorSource = new VectorSource({
            features: [marker]
          });
          var vectorLayer = new VectorLayer({
            source: vectorSource
          });

          map.addLayer(vectorLayer);

          return map;
        }
    }
});
