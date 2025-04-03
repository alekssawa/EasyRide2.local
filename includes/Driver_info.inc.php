<?php
require_once '../includes/db.inc.php';
require_once '../includes/login_model.inc.php';
require_once '../includes/login_contr.inc.php';

if (!isset($_SESSION["user_status"])) {
    die("Неизвестный статус пользователя");
}

$user_id = $_SESSION["user_id"];
$user_status = $_SESSION["user_status"];

try {
    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }
    $query = "SELECT t.trip_id AS id, d.driver_p_i_b AS driver, d.driver_id, c.car_model, c.car_registration_plate, 
                     t.trip_client_start_location AS start_location, t.trip_client_destination AS destination, 
                     tar.tariff_name AS tariff, p.payment_amount AS amount, t.trip_payment_type AS payment_type, 
                     t.trip_start_time AS start_time, t.trip_end_time AS end_time
              FROM triphistory t
              JOIN tariffs tar ON t.trip_tariff_id = tar.tariff_id
              JOIN drivers d ON t.trip_driver_id = d.driver_id
              JOIN payments p ON t.trip_payment_id = p.payment_id
              LEFT JOIN cars c ON d.driver_car_id = c.car_id
              WHERE ". ($user_status == "Client" ? "t.trip_client_id = :user_id" : "t.trip_driver_id = :user_id");

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $stmt = $pdo->prepare("SELECT AVG(review_rating) AS average_rating FROM reviews_drivers WHERE review_driver_id = :driver_id");
        $stmt->bindParam(":driver_id", $order["driver_id"]);
        $stmt->execute();
        $order["average_rating"] = round($stmt->fetchColumn(), 2) ?: 0;
    }
} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
}
?>