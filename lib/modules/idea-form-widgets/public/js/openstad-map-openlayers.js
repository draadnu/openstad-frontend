// Todo: refactor this check
if (typeof mapConfigSetting !== "undefined" && mapConfigSetting === "openlayers") {
    var nlMapsHolder = document.getElementById('nlmaps-holder-idea-form');
    nlMapsHolder.style.height = '400px'; // Change to required height

    const GeoJSON = ol.format.GeoJSON;
    const VectorLayer = ol.layer.Vector;
    const VectorSource = ol.source.Vector;
    const Style = ol.style.Style;
    const Fill = ol.style.Fill;
    const Stroke = ol.style.Stroke;
    const MultiPoint = ol.geom.MultiPoint;
    const Marker = nlmaps.openlayers.markerLayer;
    const fromLonLat = ol.proj.fromLonLat;
    const View = ol.View;

    const OpenlayersMap = {
        map: null,
        marker: null,
        options: {
            style: 'standaard',
            target: 'nlmaps-holder-idea-form',
            center: {
                longitude: openstadMapDefaults.center.lng,
                latitude: openstadMapDefaults.center.lat
            },
            overlay: 'gebouwen',
            search: false,
            zoom: openstadMapDefaults.zoom
        },
        init: function () {

            if(markerLocation) {
                this.options.center = {
                    longitude: markerLocation.coordinates[1] || openstadMapDefaults.center.lng,
                    latitude: markerLocation.coordinates[0] || openstadMapDefaults.center.lat
                }
            }

            this.createMap(this.options);
            this.addPolygon();
            this.setIdeaMarker();

            this.addEventListener();
        },
        setIdeaMarker: function () {
            //Add marker if present
            if (markerLocation) {
                var coordinate = [markerLocation.coordinates[1], markerLocation.coordinates[0]];
                this.addMarker(coordinate);
            }
        },
        createMap: function (options) {
            this.map = nlmaps.createMap(options);

            return this.map;
        },
        addMarker: function (latLong) {
            this.removeMarkers();

            var marker = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat(latLong)
                ),
            });
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(({
                    crossOrigin: 'anonymous',
                    src: '/img/idea/flag-blue-dh.png',
                    size: [25, 25]
                }))
            }));
            var vectorSource = new VectorSource({
                features: [marker]
            });
            var vectorLayer = new VectorLayer({
                source: vectorSource
            });

            this.marker = vectorLayer;

            this.map.addLayer(vectorLayer);
        },
        addEventListener: function () {

            var inside  = function (point, vs) {
                // ray-casting algorithm based on
                // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

                var x = point[0], y = point[1];

                var inside = false;
                for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                    var xi = vs[i][0], yi = vs[i][1];
                    var xj = vs[j][0], yj = vs[j][1];

                    var intersect = ((yi > y) != (yj > y))
                        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                    if (intersect) inside = !inside;
                }

                return inside;
            };

            var polygonCoords = [];
            polygonLngLat.forEach(function (pointPair) {
                var newPair = ol.proj.fromLonLat([pointPair.lng, pointPair.lat], 'EPSG:3857');
                polygonCoords.push(newPair);
            });

            var self = this;
            this.map.on('click', function (event) {

                var pickerCoords = {
                    latitude: event.coordinate[1],
                    longitude: event.coordinate[0]
                };

                var picker = [pickerCoords.longitude, pickerCoords.latitude, ];

                if (inside(picker, polygonCoords)) {
                    var latLong = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
                    var coordinate = {
                        latitude: latLong[1],
                        longitude: latLong[0]
                    };

                    self.addMarker(latLong);

                    var point = {type: 'Point', coordinates: [coordinate.latitude, coordinate.longitude]};
                    var coordinateValue = JSON.stringify(point);

                    editorInputElement.value = coordinateValue;
                }

            }, 'click');
        },
        addPolygon: function () {
            this.map.addLayer(buildInvertedPolygon());
            this.map.addLayer(buildOutlinedPolygon());
        },
        removeMarkers: function () {
            this.map.removeLayer(this.marker);
        }
    };

    OpenlayersMap.init();

    document.addEventListener("DOMContentLoaded", function () {
        $('.ol-viewport').append($('.nlmaps-geocoder-control-container'));
    });


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
}
