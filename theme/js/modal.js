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
