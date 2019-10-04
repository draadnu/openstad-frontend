var nlMapsHolder = document.getElementById('nlmaps-holder');
nlMapsHolder.style.height = '400px'; // Change to required height

const GeoJSON = ol.format.GeoJSON;
const VectorLayer = ol.layer.Vector;
const VectorSource = ol.source.Vector;
const Style = ol.style.Style;
const Fill = ol.style.Fill;
const Stroke = ol.style.Stroke;
const MultiPoint = ol.geom.MultiPoint;
const Marker = nlmaps.openlayers.markerLayer;


//Style for polygon
var styles = [
    new Style({
        stroke: new Stroke({
            color: 'black',
            width: 3
        }),
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0.1)'
        })
    }),
    new Style({
        geometry: function(feature) {
            // return the coordinates of the first ring of the polygon
            var coordinates = feature.getGeometry().getCoordinates()[0];
            return new MultiPoint(coordinates);
        }
    })
];

//transform lnglat array to Spherical Mercator (EPSG:3857)
var polygonCoords = [];
polygonLngLat.forEach(function(pointPair){
    var newPair = ol.proj.fromLonLat([pointPair.lng, pointPair.lat], 'EPSG:3857');
    polygonCoords.push(newPair);
});

var geojsonObject = {
    'type': 'FeatureCollection',
    'crs': {
        'type': 'name',
        'properties': {
            'name': 'EPSG:3857'
        }
    },
    'features': [{
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [polygonCoords]
        }
    }]
};

var source = new VectorSource({
    features: (new GeoJSON()).readFeatures(geojsonObject)
});

var layer = new VectorLayer({
    source: source,
    style: styles
});

var opts = {
    style: 'standaard',
    target: 'nlmaps-holder',
    center: {
        longitude: 4.2322689,
        latitude: 52.04946
    },
    overlay: 'gebouwen',
    search: false,
    zoom: 15.3
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

map.on('click', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {

            return feature.getProperties().href ? feature : null;
        }, {hitTolerance: 4});

    if (feature) {
        window.location.href = feature.getProperties().href;
    }
});

// change mouse cursor when over marker
map.on('pointermove', function(e) {
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel, {hitTolerance: 4});
    document.getElementById(map.getTarget()).style.cursor = hit ? 'pointer' : '';
});

document.addEventListener("DOMContentLoaded", function() {
    $('.ol-viewport').append($('.nlmaps-geocoder-control-container'));
});

$('#themaSelector').change(function(event) {
    var filteredMarkers = [];
    // Todo: refactor and try another way to add all markers to the map.
    markers.forEach(function(marker) {
        try {
            vectorSource.addFeature(marker);
        } catch(e) {
            // do nothing.
        }
    });
    if(event.target.value == '0') {
        return;
    }
    vectorSource.forEachFeature(function(feature) {
        if(feature.getProperties().category !== event.target.value) {
            vectorSource.removeFeature(feature);
        }
    })
});


