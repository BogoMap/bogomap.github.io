var map;
var feature;

function load_map(url_params) {

  var humanitarian = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Teselas © <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>; Información geográfica © <a href="http://openstreetmap.org">OpenStreetMap</a>'
  });
  var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© Colaboradores de <a href="http://openstreetmap.org">OpenStreetMap</a>'
  });http:
  var pub_transport = L.tileLayer('http://tile.memomaps.de/tilegen/{z}/{x}/{y}.png', {
    attribution: 'Teselas © <a href="http://memomaps.de/">MeMoMaps</a>; Información geográfica © <a href="http://openstreetmap.org">OpenStreetMap</a>'
  });
  var mapbox = L.tileLayer('http://{s}.tiles.mapbox.com/v3/jaakkoh.map-4ch3dsvl/{z}/{x}/{y}.png', {
    attribution: 'Teselas © <a href="http://mapbox.com/">Mapbox</a>; Información geográfica © <a href="http://openstreetmap.org">OpenStreetMap</a>'
  });

  var baseLayers = {
    "Transporte público": pub_transport,
    "Humanitarian": humanitarian,
    "OpenStreetMap": osm,
    "Mapbox": mapbox,
  };

  // Initialize map
  map = new L.map('map', {
    center: [4.65,-74.07],
    zoom: 13,
    attributionControl: false,
    layers: baseLayers[url_params.layers] || pub_transport
  });

  // Adding hash for position in url
  var hash = new L.Hash(map);

  // Adding attribution to desired position
  L.control.attribution({position: 'bottomleft'}).addTo(map);

  // Adding layer functionality
  var layers = L.control.activeLayers(baseLayers);
  layers.setPosition('bottomleft').addTo(map);

}

function get_params(search) {
  var params = {};

  search = (search || window.location.search).replace('?', '').split(/&|;/);

  for (var i = 0; i < search.length; ++i) {
    var pair = search[i],
    j = pair.indexOf('='),
    key = pair.slice(0, j),
    val = pair.slice(++j);
    params[key] = decodeURIComponent(val);
  }
  return params;
}

// Add / Update a key-value pair in the URL query parameters
function updateUrlParameter(uri, key, value) {
    // remove the hash part before operating on the uri
    var i = uri.indexOf('#');
    var hash = i === -1 ? ''  : uri.substr(i);
         uri = i === -1 ? uri : uri.substr(0, i);

    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        uri = uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        uri = uri + separator + key + "=" + value;
    }
    return uri + hash;  // finally append the hash as well
}

function loadBusRoute(busDetailLayerGroup, bus_number, category) {

  // Clear old bus line
  busDetailLayerGroup.clearLayers();

  // Define colors for transport categories
  var transportCategories = {
    'lines-principal': '#00ff00',
    'lines-central': '#c69c6d',
    'lines-eastern': '#BB5BDE',
    'lines-western': '#00ffff',
    'lines-northern': '#f15a24',
    'lines-southern': '#0000ff',

  }
  var myStyle = {
    color: transportCategories[category],

  }

  var geojsonMarkerOptions = {
    radius: 6,
    fillColor: "#fff",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 1,
    riseOnHover: true,
  };

  // Load data from file
  $.ajax({
    type: "GET",
    url: "/data/" + bus_number + "-1.geojson",
    dataType: 'json',
    async: true,
    cache: true,
    success: function (response) {
        // Define content of popup
        geojsonLayer = L.geoJson(response, {
          style: myStyle,
          pointToLayer: function (feature, latlng) {
            marker = L.circleMarker(latlng, geojsonMarkerOptions);
            return marker;
          },
          onEachFeature: function (feature, layer) {
            if (feature.geometry.type == 'Point') {
              layer.bindLabel(feature.properties.name, {noHide: false});
            }
            //layer.bindPopup(feature.properties.name);
        }});
        busDetailLayerGroup.addLayer(geojsonLayer);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus + " (1): " + errorThrown);
   }
  });

      // Load data from file
  $.ajax({
    type: "GET",
    url: "/data/" + bus_number + "-2.geojson",
    dataType: 'json',
    async: true,
    cache: true,
    success: function (response) {
        // Define content of popup
        geojsonLayer = L.geoJson(response, {
          style: myStyle,
          pointToLayer: function (feature, latlng) {
            marker = L.circleMarker(latlng, geojsonMarkerOptions);
            return marker;
          },
          onEachFeature: function (feature, layer) {
            if (feature.geometry.type == 'Point') {
              layer.bindLabel(feature.properties.name, {noHide: false});
            }
            //layer.bindPopup(feature.properties.name);
        }});
        busDetailLayerGroup.addLayer(geojsonLayer);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus + " (2): " + errorThrown);
    }
  });
}

$(document).ready(function() {

  // Obtain parameters from url
  var url_params = get_params();

  load_map(url_params);

  var busDetailLayerGroup = new L.LayerGroup();
  busDetailLayerGroup.addTo(map);
  if (typeof url_params.ruta !== 'undefined') {
    bus_number = url_params.ruta;
    category = $(this).find(".ruta-" + url_params.ruta).parent().attr("class");
    loadBusRoute(busDetailLayerGroup, bus_number, category);
  }


  $(".bus-line-link").click (function(e) {

    // Do not reload page
    e.preventDefault();
    console.log(e);

    // Mark link as active
    $('a.bus-active').removeClass('bus-active');
    $(this).addClass('bus-active');


     // Update uri query parameters
    if (history.pushState) {
      uri = updateUrlParameter(window.location.href, 'ruta', this.text);
      window.history.pushState({path:uri},'',uri);
    }
    console.log(this);
    loadBusRoute(busDetailLayerGroup, this.text, $(this).parent().attr("class"));
  });
});
