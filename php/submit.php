<!--
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
-->

<?php
if(isset($_POST['url']) && $_POST['url'] == ''){
  // The form was submitted
  $ouremail = 'contacto@bogomap.co';

  // Important: if we add any form fields to the HTML,
  // and want them included in the email, we will need to add them here also
  $body = "Un reporte sobre $_POST[ruta]
  De: $_POST[name]
  E-Mail: $_POST[email]
  Mensaje: $_POST[message]";
    // From:
    // Use the submitters email if they supplied one
    // (and it isn't trying to hack our form).
    // Otherwise send from our email address.
    if( $_POST['email'] && !preg_match( "/[\r\n]/", $_POST['email']) ) {
      $headers = "From: $_POST[email]";
    }
    else {
      $headers = "From: $ouremail";
    }
    // Finally, send the message
    mail($ouremail, 'Reporte de rutas.bogomap.co', $body, $headers );
    header('Location: ../../index.html?message="Gracias por tu reporte"');
  }
  else {
    header('Location: ../../index.html?message="Mensaje no enviado"');
  }
?>

