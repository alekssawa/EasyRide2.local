<?php
require_once '../includes/db.inc.php';
require_once '../includes/config_session.inc.php';
require_once '../includes/login_model.inc.php';
require_once '../includes/login_contr.inc.php';

if (!isset($pdo)) {
    echo ("ERROR DATABASE CONNECTION");
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["complete_order"])) {
    try {
        date_default_timezone_set('Europe/Kiev');
        $fullTime = date("Y-m-d H:i:s");
        $stmt_select_order_id = $pdo->prepare('SELECT * FROM orders WHERE order_driver_id = :order_driver_id AND order_order_status = :order_status_in_progress');

        $stmt_select_order_id->bindParam(":order_driver_id", $_SESSION['user_id']);
        $stmt_select_order_id->bindParam(":order_status_in_progress", $order_status_in_progress);
        $order_status_in_progress = "In progress";
        $stmt_select_order_id->execute();
        $order = $stmt_select_order_id->fetch(PDO::FETCH_ASSOC);

        if ($order !== false) {
            $order_id = $order['order_id'];

            $sql = "INSERT INTO triphistory (trip_client_id, trip_driver_id, trip_tariff_id,
                         trip_payment_id, trip_payment_type, trip_start_time, trip_end_time,
                         trip_client_start_location, trip_client_destination, trip_distance)
                        VALUES (:trip_client_id, :trip_driver_id,
                                :trip_tariff_id, :trip_payment_id, :trip_payment_type,
                                :trip_start_time, :trip_end_time, :trip_client_start_location, :trip_client_destination, :trip_distance)";

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':trip_client_id', $order['order_client_id']);
            $stmt->bindParam(':trip_driver_id', $order['order_driver_id']);
            $stmt->bindParam(':trip_tariff_id', $order['order_tariff_id']);
            $stmt->bindParam(':trip_payment_id', $order['order_payment_id']);
            $stmt->bindParam(':trip_payment_type', $order['order_payment_type']);
            $stmt->bindParam(':trip_start_time', $order['order_order_time']);
            $stmt->bindParam(':trip_end_time', $fullTime);
            $stmt->bindParam(':trip_client_start_location', $order['order_client_start_location']);
            $stmt->bindParam(':trip_client_destination', $order['order_client_destination']);
            $stmt->bindParam(':trip_distance', $order['order_distance']);

            $stmt->execute();
            $triphistory = $pdo->lastInsertId();
            echo "ID payment_id: " . $triphistory . "<br>";

            $stmt_delete_order = $pdo->prepare('DELETE FROM orders WHERE order_id = :order_id');
            $stmt_delete_order->bindParam(":order_id", $order['order_id']); // Предполагается, что вы получили ID заказа из предыдущего запроса
            $stmt_delete_order->execute();

            $deletedOrderId = $order['order_id'];
            echo "Запись с ID $deletedOrderId успешно удалена.";

            header("Location: ../Pages/MyOrder.inc.php");

        } else {
            echo "Нет заказов в процессе выполнения для текущего пользователя.";
        }

        header("Location: ../Pages/MyOrder.inc.php");

    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
    exit;
}
?>
