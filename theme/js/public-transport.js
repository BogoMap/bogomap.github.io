/*
This file is part of BogoMap-rutas.

BogoMap-rutas is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

BogoMap-rutas is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with BogoMap-rutas.  If not, see http://www.gnu.org/licenses/.
*/

var map;
var feature;
var scrolled=0;

function load_map(url_params) {

  var humanitarian = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Geo datos © <a href="http://openstreetmap.org">OpenStreetMap</a>'
  });
  var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© Colaboradores de <a href="http://openstreetmap.org">OpenStreetMap</a>'
  });http:
  var pub_transport = L.tileLayer('http://tile.memomaps.de/tilegen/{z}/{x}/{y}.png', {
    attribution: 'Geo datos © <a href="http://openstreetmap.org">OpenStreetMap</a>; Teselas © <a href="http://memomaps.de/">MeMoMaps</a>'
  });
  var new_transport = L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
    attribution: 'Geo datos © <a href="http://openstreetmap.org">OpenStreetMap</a>; Teselas © <a href="http://thunderforest.com/">Gravitystorm</a>'
  });
  var mapbox = L.tileLayer('http://{s}.tiles.mapbox.com/v3/jaakkoh.map-4ch3dsvl/{z}/{x}/{y}.png', {
    attribution: 'Geo datos © <a href="http://openstreetmap.org">OpenStreetMap</a>; Teselas © <a href="http://mapbox.com/">Mapbox</a>'
  });
  var osmsweden = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
    attribution: 'Geo datos © <a href="http://openstreetmap.org">OpenStreetMap</a>; Teselas © <a href="http://http://openstreetmap.se/">OSM Suecia</a>'
  });




  var baseLayers = {
    "Transporte público": pub_transport,
    "Humanitarian": humanitarian,
    "OpenStreetMap": osm,
    "Mapbox": mapbox,
    "OSM Sweden": osmsweden,
  };

  // Initialize map
  map = new L.map('map', {
    center: [5.829,-73.029],
    zoom: 14,
    attributionControl: false,
    layers: baseLayers[url_params.layers] || new_transport
  });

  // Adding hash for position in url
  var hash = new L.Hash(map);

  // Adding attribution to desired position
  L.control.attribution({position: 'bottomleft'}).addTo(map);

  // Adding layer functionality
  //var layers = L.control.activeLayers(baseLayers);
  //layers.setPosition('bottomleft').addTo(map);

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


function toggleExtendedBusInfo() {
  if($(".info-wrapper").hasClass("normal")){
    openExtendedBusInfo();
  }
  else if ($(".info-wrapper").hasClass("expanded")){
    closeExtendedBusInfo();
  }
}

//
function openExtendedBusInfo() {
  $(".info-wrapper").removeClass("normal");
  $(".info-wrapper").addClass("expanded");
  $("#info-expander").removeClass("fa-chevron-down");
  $("#info-expander").addClass("fa-chevron-up");
}



//
function closeExtendedBusInfo() {

  $(".info-wrapper").removeClass("expanded");
  $(".info-wrapper").addClass("normal");
  $("#info-expander").removeClass("fa-chevron-up");
  $("#info-expander").addClass("fa-chevron-down");
}

function showBusInfo() {

  // Show and fill metadata in site
  if(!$(".info-wrapper").hasClass("normal")){
     $(".info-wrapper").addClass("normal");
  }
}



//
function zoomToNode(lat, lng) {

    closeExtendedBusInfo();

    // define geographical bounds
    var bounds = [[lng+0.0001, lat+0.0001], [lng-0.0001, lat-0.0001]];
    map.fitBounds(bounds);
    map.setZoom(18);
}



function loadBusRoute(busDetailLayerGroup, bus_number, category) {

  // Clear old bus line
  busDetailLayerGroup.clearLayers();

  // Define colors for transport categories
  var transportCategories = {
    'lines-principal': '#45B549',
    'lines-central': '#A8611A',
    'lines-eastern': '#6d2fba',
    'lines-western': '#00ADEE',
    'lines-northern': '#F7921F',
    'lines-southern': '#0055FF',
    'lines-ciudadsandino': '#0076a2',
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

      // Clean out meta data
      $(".stop-overview .variant-one h4").text();
      $(".stop-overview .variant-two h4").text();
      $(".stop-overview .variant-one ul").empty();

      // Define bus stop maker
      geojsonLayer = L.geoJson(response, {
          style: myStyle,
          pointToLayer: function (feature, latlng) {
            marker = L.circleMarker(latlng, geojsonMarkerOptions);
            return marker;
          },

          // Loop through bus route elements
          onEachFeature: function (feature, layer) {

            // If it's a bus stop
            if (feature.geometry.type == 'Point') {

              // BogoMap: Test if the name value is defined.
              if (typeof feature.properties.name !== "undefined"){

              // Define content of popup
              layer.bindLabel(feature.properties.name, {noHide: false});

              // BogoMap
              } else {
                name = feature.properties;
    //            layer.bindLabel(name, {noHide: false});
              }

              // BogoMap: Test if the official_status value is defined.
              if (typeof feature.properties.attributes !== "undefined"){

              // Create list of bus stops
              if (feature.properties.attributes.official_status == "IRTRAMMA:bus_stop") {
                stopClass = "stop-official";
              }
              else if (feature.properties.attributes.official_status == "IRTRAMMA:bus_station") {
                stopClass = "stop-station";
              }
              else if (feature.properties.attributes.official_status == "none") {
                stopClass = "stop-popular";
              }
              else {
                stopClass = "stop-undefined";
              }

              // BogoMap
              } else {
                stopClass = "stop-undefined";
              }

              if (feature.properties.name === '') {
                feature.properties.name = '<span class="stop-unknown">Nombre desconocido</span>';
              }
              $('.stop-overview .variant-one ul').append('<li class="'+stopClass+'"><a href="#" onclick="zoomToNode('+feature.geometry.coordinates[0]+', '+feature.geometry.coordinates[1]+');return false;">'+feature.properties.name+'</a></li>');
            }

            // If it's the bus route
            else if (feature.geometry.type == 'LineString' || feature.geometry.type == 'MultiLineString') {

              showBusInfo();

              // BogoMap: Test if the ref value is defined.
              if (typeof feature.properties.attributes !== "undefined" && typeof feature.properties.attributes.ref !== "undefined"){

              $(".info-wrapper .ref").text("Ruta " + feature.properties.attributes.ref);

              // BogoMap
              } else {
                ref = feature.properties["@relations"][0].reltags.ref;
                $(".info-wrapper .ref").text("Ruta " + ref);
              }
              // BogoMap: Test if the from value is defined.
              if (typeof feature.properties.attributes !== "undefined" && typeof feature.properties.attributes.from !== "undefined"){

              $(".info-wrapper .from").text(feature.properties.attributes.from);

              // BogoMap
              } else {
                from = feature.properties["@relations"][0].reltags.from;
                $(".info-wrapper .from").text(from);
              }
              // BogoMap: Test if the to value is defined.
              if (typeof feature.properties.attributes !== "undefined" && typeof feature.properties.attributes.to !== "undefined"){

              $(".info-wrapper .to").text(feature.properties.attributes.to);

              // BogoMap
              } else {
                to = feature.properties["@relations"][0].reltags.to;
                $(".info-wrapper .to").text(to);
              }
              // BogoMap: Test if the operator value is defined.
              if (typeof feature.properties.attributes !== "undefined" && typeof feature.properties.attributes.operator !== "undefined"){

              $(".info-wrapper .operator").text("Operada por:  " + feature.properties.attributes.operator);

              // BogoMap
              } else {
                operator = feature.properties["@relations"][0].reltags.operator;
                $(".info-wrapper .operator").text(operator);
              }

              // BogoMap: Test if the from value is defined.
              if (typeof feature.properties.attributes !== "undefined" && typeof feature.properties.attributes.from !== "undefined" && typeof feature.properties.attributes.to !== "undefined"){

              $(".stop-overview .variant-one h4").text(feature.properties.attributes.from + " -> " + feature.properties.attributes.to);
              $(".stop-overview .variant-two h4").text(feature.properties.attributes.to + " -> " + feature.properties.attributes.from);

              // BogoMap
              } else {
                to = feature.properties["@relations"][0].reltags.to;
                from = feature.properties["@relations"][0].reltags.from;
                $(".stop-overview .variant-one h4").text(from + " -> " + to);
                $(".stop-overview .variant-two h4").text(to + " -> " + from);
              }

            }
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

      // Clean out meta data
      $(".stop-overview .variant-two ul").empty();

      // Define bus stop maker
      geojsonLayer = L.geoJson(response, {
          style: myStyle,
          pointToLayer: function (feature, latlng) {
            marker = L.circleMarker(latlng, geojsonMarkerOptions);
            return marker;
          },

          // Loop through bus route elements
          onEachFeature: function (feature, layer) {

            // If it's a bus stop
            if (feature.geometry.type == 'Point') {

              // BogoMap: Test if the name value is defined.
              if (typeof feature.properties.name !== "undefined"){

              // Define content of popup
              layer.bindLabel(feature.properties.name, {noHide: false});

              // BogoMap
              }

              // BogoMap: Test if the official_status value is defined.
              if (typeof feature.properties.attributes !== "undefined"){

              // Create list of bus stops
              if (feature.properties.attributes.official_status == "IRTRAMMA:bus_stop") {
                stopClass = "stop-official";
              }
              else if (feature.properties.attributes.official_status == "IRTRAMMA:bus_station") {
                stopClass = "stop-station";
              }
              else if (feature.properties.attributes.official_status == "none") {
                stopClass = "stop-popular";
              }
              else {
                stopClass = "stop-undefined";
              }

              // BogoMap
              } else {
                stopClass = "stop-undefined";
              }

              if (feature.properties.name === '') {
                feature.properties.name = '<span class="stop-unknown">Nombre desconocido</span>';
              }
              $('.stop-overview .variant-two ul').append('<li class="'+stopClass+'"><a href="#" onclick="zoomToNode('+feature.geometry.coordinates[0]+', '+feature.geometry.coordinates[1]+');return false;">'+feature.properties.name+'</a></li>');
            }
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

  // Load maps (with predefined route if given)
  load_map(url_params);
  var busDetailLayerGroup = new L.LayerGroup();
  busDetailLayerGroup.addTo(map);
  if (typeof url_params.ruta !== 'undefined') {
    bus_number = url_params.ruta;
    category = $(this).find(".ruta-" + url_params.ruta).attr("class").match(/\lines-\w+/i).pop();
    loadBusRoute(busDetailLayerGroup, bus_number, category);
  }

  // Show or hide extended bus info
  $("#info-expander ").click (function(e) {
    toggleExtendedBusInfo();

  });

  // Switch highligted bus route
  $(".bus-line-link").click (function(e) {

    // Do not reload page
    e.preventDefault();

    // Mark link as active
    $('a.bus-active').removeClass('bus-active');
    $(this).addClass('bus-active');


     // Update uri query parameters
    if (history.pushState) {
      uri = updateUrlParameter(window.location.href, 'ruta', this.text);
      window.history.pushState({path:uri},'',uri);
    }
    loadBusRoute(busDetailLayerGroup, this.text, $(this).attr("class").match(/\lines-\w+/i));
  });


  // Allow scrolling through bus route navigation by buttons
  $("#bus-lines-control-top").on("click" ,function(){
    scrolled=scrolled+240;
    $("#bus-lines").animate({
      scrollTop:  scrolled
    });
  });

  $("#bus-lines-control-bottom").on("click" ,function(){
    scrolled=scrolled-240;
    $("#bus-lines").animate({
      scrollTop:  scrolled
    });
  });
});

