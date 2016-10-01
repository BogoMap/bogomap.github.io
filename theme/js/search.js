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

$(document).ready(function (){

  var search = function(){
    var inp = document.getElementById("search-string") + ", Bogota, Colombia";
    $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + inp.value, function(data) {
    var items = [];
    $.each(data, function(key, val) {
      bb = val.boundingbox;
      items.push("<p><a href='#' onclick='elegirResultado(" + bb[0] + ", " + bb[2] + ", " + bb[1] + ", " + bb[3]  + ", \"" + val.osm_type + "\");return false;'>" + val.display_name + '</a></p>');
    });

    $('#modal-content').empty();
      if (items.length != 0) {
        $('#modal-content').html(items.join(''));
      } else {
        $('<div/>', { html: "No se encontraron resultados." }).appendTo('#modal-content');
      }
    });

  }

  // Search callback
  $('#search').bind('click',function(e){

    // Avoiding reload of page after form submit
    e.preventDefault();

    // Define modal
    modal.open({content: '<img src="/theme/img/loading.gif" alt="Cargando"/>'});

    // Search callback logic
    var inp = document.getElementById("search-string");
    $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + inp.value + ", Bogota, Colombia", function(data) {
      var items = [];
      $.each(data, function(key, val) {
        bb = val.boundingbox;
        items.push("<p><a href='#' onclick='chooseResult(" + bb[0] + ", " + bb[2] + ", " + bb[1] + ", " + bb[3]  + ", \"" + val.osm_type + "\");return false;'>" + val.display_name + '</a></p>');
      });

      $('#modal-content').empty();
      if (items.length != 0) {
        $('#modal-content').html(items.join(''));
      } else {
        $('<div/>', { html: "No se encontraron resultados." }).appendTo('#modal-content');
      }
    });
  });
});

function chooseResult(lat1, lng1, lat2, lng2, osm_type) {

  modal.close();
  var loc1 = new L.LatLng(lat1, lng1);
  var loc2 = new L.LatLng(lat2, lng2);
  var bounds = new L.LatLngBounds(loc1, loc2);

  if (feature) {
    map.removeLayer(feature);
  }

  if (osm_type == "node") {
    feature = L.circle( loc1, 16, {color: 'cyan', fill: false}).addTo(map);
    feature.bindPopup(loc1+" ");
    map.fitBounds(bounds);
    map.setZoom(18);
  } else {
    var loc3 = new L.LatLng(lat1, lng2);
    var loc4 = new L.LatLng(lat2, lng1);

    feature = L.polyline( [loc1, loc4, loc2, loc3, loc1], {color: 'red'}).addTo(map);
    feature.bindPopup(loc1+" "+loc1+" "+loc2+" "+loc3);
    map.fitBounds(bounds);
  }
}
