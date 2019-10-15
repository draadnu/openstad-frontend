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
    
    var opts = {
        style:   'standaard',
        target:  'nlmaps-holder',
        center:  {
            longitude: centerLng,
            latitude:  centerLat
        },
        overlay: 'gebouwen',
        search:  false,
        zoom:    mapZoomLevel
    };

    //create map
    var map = nlmaps.createMap(opts);
    map.addLayer(buildInvertedPolygon());
    map.addLayer(buildOutlinedPolygon());

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

    if (!!div) {
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
}

function getInvertCoordinates() {

    var coordinates = [{"lng": 0, "lat": 90},{"lng": 180, "lat": 90},{"lng": 180, "lat": -90},{"lng": 0, "lat": -90},{"lng": -180, "lat": -90},{"lng": -180, "lat": 0},{"lng": -180, "lat": 90},{"lng": 0, "lat": 90}];

    var invertCoords = [];
    coordinates.forEach(function (pointPair) {
        var newPair = ol.proj.fromLonLat([pointPair.lng, pointPair.lat], 'EPSG:3857');
        invertCoords.push(newPair);
    });

    return invertCoords;
}

function createInvertedGeojsonObject(coordinates) {
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
                'coordinates': [getInvertCoordinates(), coordinates]
            }
        }]
    };

    return geojsonObject;
}

function createGeojsonObject(coordinates) {
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
                'coordinates': [coordinates]
            }
        }]
    };

    return geojsonObject;
}

function getTransformedPolygon() {
    //transform lnglat array to Spherical Mercator (EPSG:3857)
    var polygonCoords = [];
    polygonLngLat.forEach(function (pointPair) {
        var newPair = ol.proj.fromLonLat([pointPair.lng, pointPair.lat], 'EPSG:3857');
        polygonCoords.push(newPair);
    });

    return polygonCoords;
}


function buildOutlinedPolygon() {
    //Style for the outlined polygon
    var outlineStyles = [
        new Style({
            stroke: new Stroke({
                color: 'black',
                width: 3
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

    var source = new VectorSource({
        features: (new GeoJSON()).readFeatures(createGeojsonObject(getTransformedPolygon()))
    });

    var outlinedLayer = new VectorLayer({
        source: source,
        style:   outlineStyles
    });

    return outlinedLayer;
}

function buildInvertedPolygon() {
    //Style for the inverted polygon
    var invertedStyles = [
        new Style({
            fill:   new Fill({
                color: 'rgba(0, 0, 0, 0.2)'
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

    var source = new VectorSource({
        features: (new GeoJSON()).readFeatures(createInvertedGeojsonObject(getTransformedPolygon()))
    });

    var invertedLayer = new VectorLayer({
        source: source,
        style:   invertedStyles
    });

    return invertedLayer;
}

