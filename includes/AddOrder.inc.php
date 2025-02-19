<?php
$testt = "1";


try {
    require_once "../includes/config_session.inc.php";
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    echo '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>';
    echo '<script src="../Scripts/script.js" defer></script>';

    $order_status_in_progress = "In progress";

    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }

    if(isset($_SESSION["user_id"])) {
        $sql = "SELECT 1 FROM orders WHERE order_client_id = :client_id AND order_order_status = :order_status_in_progress LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':client_id', $_SESSION["user_id"], PDO::PARAM_INT);
        $stmt->bindParam(":order_status_in_progress", $order_status_in_progress);
        $stmt->execute();

        if ($stmt->fetch()) {
            // Если найдена хотя бы одна запись
            header("Location: ../Pages/MyOrder.inc.php");
        } else {
            session_start();
            if (isset($_SESSION['user_id'])) {echo '<p>User_id: ' . $_SESSION['user_id'] . '</p>'; }else {echo '<p>Variable not set in session</p>';};
            if (isset($_SESSION['GTime'])) {echo '<p>' . $_SESSION['GTime'] . '</p>'; }else {echo '<p>Variable not set in session</p>';};
            if (isset($_SESSION['selectedPaymentType'])) {echo '<p>' . $_SESSION['selectedPaymentType'] . '</p>';}else {echo '<p>Variable not set in session</p>';};
            if (isset($_SESSION['selectedTariff'])) {echo '<p>' . $_SESSION['selectedTariff'] . '</p>';}else {echo '<p>Variable not set in session</p>'; };
            if (isset($_SESSION['GStartAddress'])) {echo '<p>' . $_SESSION['GStartAddress'] . '</p>';}else {echo '<p>Variable not set in session</p>';};
            if (isset($_SESSION['GEndAddress'])) {echo '<p>' . $_SESSION['GEndAddress'] . '</p>';}else {echo '<p>Variable not set in session</p>';};

            $payment_amount = rand(75,500);
            $order_status = 'In progress';
            $sql = "INSERT INTO payments (payment_amount, payment_date_time) VALUES (:amount, :payment_date) RETURNING payment_id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':amount', $payment_amount);
            $stmt->bindParam(':payment_date', $_SESSION['GTime']);
            $stmt->execute();
            $payment_id = $stmt->fetchColumn();
            echo "ID payment_id: " . $payment_id . "<br>";

            $sql = "
                SELECT tariff_id
                FROM tariffs
                WHERE tariff_name = :tariff_name;
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':tariff_name', $_SESSION['selectedTariff']);
            $stmt->execute();
            $tariff = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($tariff) {
                echo "ID Тарифа: " . $tariff['tariff_id'] . "<br>";
            } else {
                echo "Тариф с названием ".$_SESSION['selectedTariff']."не найден.";
            }

//            $sql = "
//                SELECT drivers.driver_id
//                FROM drivers
//                LEFT JOIN orders o ON drivers.driver_id = order_driver_id AND order_order_status = 'In progress'
//                WHERE order_driver_id IS NULL
//                ORDER BY drivers.driver_id ASC;
//            ";
            $sql = "
                SELECT d.driver_id
                FROM drivers d
                LEFT JOIN orders o ON d.driver_id = o.order_driver_id AND o.order_order_status = 'In progress'
                JOIN cars c ON d.driver_car_id = c.car_id
                JOIN tariffs t ON c.car_tariff_id = t.tariff_id
                WHERE o.order_driver_id IS NULL
                AND t.tariff_id = :order_tariff_id
                ORDER BY d.driver_id ASC;
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':order_tariff_id', $tariff['tariff_id'], PDO::PARAM_INT); // Указываем тип данных
            $stmt->execute();
            $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($drivers)) {
                echo "Нет водителей без активных заказов.";
            } else {
                echo "Водители без активных заказов:<br>";
                foreach ($drivers as $driver) {
                    echo "ID Водителя: " . $driver['driver_id']. "<br>";
                }
                echo "ID Выбраного Водителя: ". $drivers[0]['driver_id']. "<br>";
            }

            $sql = "INSERT INTO orders (order_payment_id,order_client_id, order_driver_id,order_tariff_id, 
                    order_order_time, order_client_start_location, order_client_destination, order_payment_type, order_order_status)
            VALUES (:order_payment_id, :order_client_id, :order_driver_id,:order_tariff_id,
                    :order_order_time,:order_client_start_location, :order_client_destination, :order_payment_type, :order_order_status)";
            $stmt = $pdo->prepare($sql);

            // Привязка параметров
            $stmt->bindParam(':order_payment_id', $payment_id);
            $stmt->bindParam(':order_client_id', $_SESSION['user_id']);
            $stmt->bindParam(':order_driver_id', $drivers[0]['driver_id']);
            $stmt->bindParam(':order_tariff_id', $tariff['tariff_id']);
            $stmt->bindParam(':order_order_time', $_SESSION['GTime']);
            $stmt->bindParam(':order_client_start_location', $_SESSION['GStartAddress']);
            $stmt->bindParam(':order_client_destination', $_SESSION['GEndAddress']);
            $stmt->bindParam(':order_payment_type', $_SESSION['selectedPaymentType']);
            $stmt->bindParam(':order_order_status', $order_status);

            if ($stmt->execute()) {
                // Check if a row was inserted
                if ($stmt->rowCount() > 0) {
                    echo "Order successfully added.";
                } else {
                    echo "No rows inserted.";
                }
            } else {
                echo "Error inserting order: " . implode(":", $stmt->errorInfo());
            }

            header("Location: ../Pages/MyOrder.inc.php");
        }

    }else {
        header("Location: ../main.php?showLoginForm=1");
        exit();
//        echo "<script>window.addEventListener('DOMContentLoaded', function() {
//        showLoginForm();
//    });</script>";
    }



} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());

}
?>
