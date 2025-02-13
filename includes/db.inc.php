<?php
$host = 'localhost';
$dbname= 'easyride';
$dbusername = 'postgres';
$dbpassword = 'root';

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $dbusername, $dbpassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//    if(!isset($_SESSION["user_email"])){
//        echo ("1");
//    } else{
//        echo ($_SESSION["user_email"]);
//    }
    //echo '<script>console.log("norm")</script';

//    $stmt = $pdo->query('SELECT * FROM clients');
//
//    // Получение всех строк результата
//    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
//
//    if ($clients) {
//        echo '<table border="1">';
//        echo '<tr>';
//        // Вывод заголовков таблицы
//        foreach (array_keys($clients[0]) as $column) {
//            echo "<th>$column</th>";
//        }
//        echo '</tr>';
//        // Вывод данных таблицы
//        foreach ($clients as $client) {
//            echo '<tr>';
//            foreach ($client as $value) {
//                echo "<td>$value</td>";
//            }
//            echo '</tr>';
//        }
//        echo '</table>';
//    } else {
//        echo 'Таблица clients пуста.';
//    }


} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
    echo '<script>console.log("fail")</script';
}

?>