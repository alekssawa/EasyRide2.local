<?php
try {
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }
    $stmt = $pdo->prepare('SELECT car_model, car_registration_plate, car_model_year, tariff_name 
    FROM cars 
    JOIN drivers ON car_id = driver_car_id
    JOIN tariffs ON car_tariff_id = tariff_id
         WHERE driver_id = :driver_id');

// Подстановка параметра из сессии или из другого источника
    $stmt->bindParam(":driver_id", $_SESSION["user_id"]);
    $stmt->execute();

// Извлечение данных о машине
    $car_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($car_data) {
//        echo "<p>Модель машины: "</p><p>". $car_data['car_model'] ."</p> "<br>".
//            "Номера машины: " . $car_data['car_registration_plate'] . "<br>".
//            "Год выпуска: " . $car_data['car_model_year'] . "<br>".
//            "Тариф: " . $car_data['tariff_name'] . "<br></p>";
        echo "<p>Модель машины: " . $car_data['car_model'] . "</p>";
        echo "<p>Номера машины: " . $car_data['car_registration_plate'] . "</p>";
        echo "<p>Год выпуска: " . $car_data['car_model_year'] . "</p>";
        echo "<p>Тариф: " . $car_data['tariff_name'] . "</p>";



    }

    } catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());

}
?>