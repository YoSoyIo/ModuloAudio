<?php
echo "Entro PHP";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $audio = file_get_contents($_FILES['audio']['tmp_name']);

  // Conecta a la base de datos
  $servername = "127.0.0.1";
  $username = "root";
  $password = "";
  $dbname = "pruebas_servicio";

  $conn = new mysqli($servername, $username, $password, $dbname);

  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  // Inserta el archivo de audio en la base de datos
  $sql = "INSERT INTO audios (nombre, tipo, contenido) VALUES (?, ?, ?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("sss", $nombre, $tipo, $contenido);
  $nombre = $_FILES['audio']['name'];
  $tipo = $_FILES['audio']['type'];
  $contenido = $audio;
  $stmt->execute();

  // Cierra la conexión a la base de datos
  $stmt->close();
  $conn->close();
}

?>
