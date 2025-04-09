<?php
require_once '../includes/db.inc.php';
require_once '../includes/config_session.inc.php';
require_once '../includes/login_model.inc.php';
require_once '../includes/login_contr.inc.php';

if (!isset($pdo)) {
    echo ("ERROR DATABASE CONNECTION");
}

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["canceled_order"])) {
    try {
        $order_status_in_progress = "In progress";

        if ($_SESSION["user_status"] === "Client") {
            $stmt_select_order_id = $pdo->prepare('SELECT order_id FROM orders WHERE order_client_id = :order_client_id AND order_order_status = :order_status_in_progress');

            // Привязка параметров
            $stmt_select_order_id->bindParam(":order_client_id", $_SESSION["user_id"]);
            $stmt_select_order_id->bindParam(":order_status_in_progress", $order_status_in_progress);

            // Выполнение запроса
            $stmt_select_order_id->execute();
            $order = $stmt_select_order_id->fetch(PDO::FETCH_ASSOC);

            if ($order !== false) {
                $order_id = $order['order_id'];

                // Подготовка запроса для обновления статуса заказа
                $stmt_update = $pdo->prepare('
                UPDATE orders
                SET order_order_status = :order_status_canceled
                WHERE order_client_id = :order_client_id AND order_order_status = :order_status_in_progress
            ');

                // Привязка параметров
                $order_client_id = $_SESSION["user_id"];
                $order_status_canceled = "Canceled";
                $stmt_update->bindParam(":order_client_id", $order_client_id);
                $stmt_update->bindParam(":order_status_canceled", $order_status_canceled);
                $stmt_update->bindParam(":order_status_in_progress", $order_status_in_progress);

                // Выполнение запроса
                $stmt_update->execute();

                // Проверка, было ли обновление успешным
                if ($stmt_update->rowCount() > 0) {
                    echo "Заказ с ID $order_id успешно отменен.";
                } else {
                    echo "Не удалось отменить заказ. Проверьте правильность условий.";
                }
            } else {
                echo "Нет заказов в процессе выполнения для текущего пользователя.";
            }
        } elseif ($_SESSION["user_status"] === "Driver") {
            $stmt_select_order_id = $pdo->prepare('SELECT order_id FROM orders WHERE order_driver_id = :order_driver_id AND order_order_status = :order_status_in_progress');

            // Привязка параметров
            $stmt_select_order_id->bindParam(":order_driver_id", $_SESSION["user_id"]);
            $stmt_select_order_id->bindParam(":order_status_in_progress", $order_status_in_progress);

            // Выполнение запроса
            $stmt_select_order_id->execute();
            $order = $stmt_select_order_id->fetch(PDO::FETCH_ASSOC);

            if ($order !== false) {
                $order_id = $order['order_id'];

                // Подготовка запроса для обновления статуса заказа
                $stmt_update = $pdo->prepare('
                UPDATE orders
                SET order_order_status = :order_status_canceled
                WHERE order_driver_id = :order_driver_id AND order_order_status = :order_status_in_progress
            ');

                // Привязка параметров
                $order_driver_id = $_SESSION["user_id"];
                $order_status_canceled = "Canceled";
                $stmt_update->bindParam(":order_driver_id", $order_driver_id);
                $stmt_update->bindParam(":order_status_canceled", $order_status_canceled);
                $stmt_update->bindParam(":order_status_in_progress", $order_status_in_progress);

                // Выполнение запроса
                $stmt_update->execute();

                // Проверка, было ли обновление успешным
                if ($stmt_update->rowCount() > 0) {
                    echo "Заказ с ID $order_id успешно отменен.";
                } else {
                    echo "Не удалось отменить заказ. Проверьте правильность условий.";
                }
            } else {
                echo "Нет заказов в процессе выполнения для текущего пользователя.";
            }
        }
        // header("Location: ../Pages/MyOrder.inc.php");
    } catch (PDOException $e) {
        echo "Ошибка: " . $e->getMessage();
    }
    exit;
}
