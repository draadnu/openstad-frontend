var nlMapsHolder = document.getElementById('nlmaps-holder');

if (!!nlMapsHolder) {
    nlMapsHolder.style.height = '400px'; // Change to required height
    
    var GeoJSON      = ol.format.GeoJSON;
    var VectorLayer  = ol.layer.Vector;
    var VectorSource = ol.source.Vector;
    var Style        = ol.style.Style;
    var Fill         = ol.style.Fill;
    var Stroke       = ol.style.Stroke;
    var MultiPoint   = ol.geom.MultiPoint;
    var Marker       = nlmaps.openlayers.markerLayer;

//Style for polygon
    var styles = [
        new Style({
                      stroke: new Stroke({
                                             color: 'black',
                                             width: 3
                                         }),
                      fill:   new Fill({
                                           color: 'rgba(0, 0, 0, 0.1)'
                                       })
                  }),
        new Style({
                      geometry: function (feature) {
                          // return the coordinates of the first ring of the polygon
                          var coordinates = feature.getGeometry().getCoordinates()[0];
                          return new MultiPoint(coordinates);
                      }
                  })
    ];

//transform lnglat array to Spherical Mercator (EPSG:3857)
    var polygonCoords = [];
    polygonLngLat.forEach(function (pointPair) {
        var newPair = ol.proj.fromLonLat([pointPair.lng, pointPair.lat], 'EPSG:3857');
        polygonCoords.push(newPair);
    });
    
    var geojsonObject = {
        'type':     'FeatureCollection',
        'crs':      {
            'type':       'name',
            'properties': {
                'name': 'EPSG:3857'
            }
        },
        'features': [{
            'type':     'Feature',
            'geometry': {
                'type':        'Polygon',
                'coordinates': [polygonCoords]
            }
        }]
    };
    
    var source = new VectorSource({
                                      features: (new GeoJSON()).readFeatures(geojsonObject)
                                  });
    
    var layer = new VectorLayer({
                                    source: source,
                                    style:  styles
                                });
    
    var opts = {
        style:   'standaard',
        target:  'nlmaps-holder',
        center:  {
            longitude: 4.2322689,
            latitude:  52.04946
        },
        overlay: 'gebouwen',
        search:  false,
        zoom:    15.3
    };

//create map
    var map = nlmaps.createMap(opts);
    map.addLayer(layer);
    
    var vectorSource = new VectorSource({
                                            features: markers
                                        });
    
    var vectorLayer = new VectorLayer({
                                          source: vectorSource
                                      });
    map.addLayer(vectorLayer);
    
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
        var pixel                                             = map.getEventPixel(e.originalEvent);
        var hit                                               = map.hasFeatureAtPixel(pixel, {hitTolerance: 4});
        document.getElementById(map.getTarget()).style.cursor = hit ? 'pointer' : '';
    });
    
    document.addEventListener("DOMContentLoaded", function () {
        $('.ol-viewport').append($('.nlmaps-geocoder-control-container'));
    });
    
    $('#themaSelector').change(function (event) {
        vectorSource.clear();
        if (event.target.value == '0') {
            vectorSource.addFeatures(markers);
            return;
        }
        
        markers.forEach(function (feature) {
            if (feature.getProperties().category === event.target.value) {
                vectorSource.addFeature(feature);
            }
        });
    });
}

if (!!map && typeof ol != 'undefined' && !!ol) {
// Strg+MouseWheel Zoom
    map.addInteraction(new ol.interaction.MouseWheelZoom({condition: function (e) { return e.originalEvent.ctrlKey }}));

// desktop: normal; mobile: 2-finger pan to start
    map.addInteraction(new ol.interaction.DragPan({
                                                      condition: function (e) {
                                                          return ol.events.condition.noModifierKeys(e) && (!/Mobi|Android/i.test(navigator.userAgent) || (this.targetPointers && this.targetPointers.length === 2))
                                                      }
                                                  }));

// the quick-changing holder of last touchmove y
    var lastTouchY = null
    
    var div            = document.getElementById('nlmaps-holder')
    var scrollerBlades = document.scrollingElement || document.documentElement
    
    div.addEventListener('touchmove', function (e) {
        e.preventDefault()
        var touches = e.touches || e.changedTouches
        // on 1-finger-touchmove, scroll and take note of prev y
        if (touches.length === 1) {
            if (lastTouchY !== null) {
                var by = lastTouchY - touches[0].clientY
                scrollerBlades.scrollTop += by
            }
            lastTouchY = touches[0].clientY
        }
    })

// on touchend, reset y
    div.addEventListener('touchend', function (e) { lastTouchY = null });
}

