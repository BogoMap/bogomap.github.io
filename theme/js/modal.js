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

var modal = (function(){
  var
  method = {},
  $modal,
  $content,
  $close;

  // Open the modal
  method.open = function (settings) {
      $content.empty().append(settings.content);

      $modal.css({
          height: settings.height || 'auto'
      })
      $modal.show();
  };

  // Close the modal
  method.close = function () {
    $modal.hide();
    $content.empty();
    $(window).unbind('resize.modal');
  };

  $modal = $('<div id="modal"></div>');
  $content = $('<div id="modal-content"></div>');
  $close = $('<a id="modal-close" href="#">close</a>');

  $modal.hide();
  $modal.append($content, $close);

  $(document).ready(function(){
    $('body').append($modal);
  });

  $close.click(function(e){
    e.preventDefault();
    method.close();
  });

  return method;
}());
