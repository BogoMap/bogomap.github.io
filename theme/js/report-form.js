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

  // Search callback
  $('#report').bind('click',function(e){

    // Avoiding reload of page after form submit
    e.preventDefault();

    // Define modal
    modal.open({content: '<img src="/theme/img/loading.gif" alt="Cargando"/>'});
    $('#modal-content').html(
      $('#modal-content').load('contact.html')
    )

    $.get('/contact.html', function(result) {
        $('#modal-content').val(result);
        // Obtain parameters from url
        var url_params = get_params();
        if (typeof url_params.ruta !== 'undefined') {
          bus_number = 'la ruta ' + url_params.ruta;
        }
        else {
          bus_number = "ninguna ruta";
        }
        $('#route-number').val(bus_number);
        $('#route-number-text').html(bus_number);
    });
  });
});
