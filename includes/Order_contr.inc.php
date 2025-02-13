<?php
try {
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }
    if($_SESSION["user_status"] == "Client") {
        $stmt = $pdo->prepare('SELECT orders.order_id as id, drivers.driver_p_i_b as driver, 
        tariffs.tariff_name as tariff, 
        orders.order_order_time as time, orders.order_client_start_location as start_location,
        orders.order_client_destination as destination, orders.order_payment_type as payment_type, 
        orders.order_order_status as status
        FROM orders 
        JOIN tariffs ON orders.order_tariff_id = tariffs.tariff_id
        JOIN drivers ON orders.order_driver_id = drivers.driver_id
        WHERE order_client_id = :order_client_id
        AND orders.order_order_status = :order_order_status
        ORDER BY orders.order_id;');

        $stmt->bindParam(":order_client_id", $_SESSION["user_id"]);
        $stmt->bindParam(":order_order_status", $status);
        $status = "In progress";
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);


        if ($orders) {
            echo '<table class="content-table">';
            echo '<thead>';
            echo '<tr>';
            // Вывод заголовков таблицы
            foreach (array_keys($orders[0]) as $column) {
                echo "<th>$column</th>";
            }
            echo '</tr>';
            echo '</thead>';
            // Вывод данных таблицы
            echo '<tbody>';
            foreach ($orders as $order) {
                echo '<tr>';
                foreach ($order as $value) {
                    echo "<td>$value</td>";
                }
                echo '</tr>';
            }
            echo '</tbody>';
            echo '</table>';
        } else {
            echo '<p>У вас немає подорожі</p>';
        }
    } elseif ($_SESSION["user_status"] == "Driver"){
        $stmt = $pdo->prepare('SELECT orders.order_id as id, clients.client_p_i_b as client, 
        tariffs.tariff_name as tariff, 
        orders.order_order_time as time, orders.order_client_start_location as start_location,
        orders.order_client_destination as destination, orders.order_payment_type as payment_type, 
        orders.order_order_status as status
        FROM orders 
        JOIN tariffs ON orders.order_tariff_id = tariffs.tariff_id
        JOIN clients ON orders.order_client_id = clients.client_id
        WHERE orders.order_driver_id = :order_driver_id
        AND orders.order_order_status = :order_order_status
        ORDER BY orders.order_id;');

        $stmt->bindParam(":order_driver_id", $_SESSION["user_id"]);
        $stmt->bindParam(":order_order_status", $status);
        $status = "In progress";
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($orders) {
            echo '<table class="content-table">';
            echo '<thead>';
            echo '<tr>';
            // Вывод заголовков таблицы
            foreach (array_keys($orders[0]) as $column) {
                echo "<th>$column";

            }
            echo '</tr>';
            echo '</thead>';
            // Вывод данных таблицы
            echo '<tbody>';
            foreach ($orders as $order) {
                echo '<tr>';
                foreach ($order as $value) {
                    echo "<td>$value</td>";
                }
                echo '</tr>';
            }
            echo '</tbody>';
            echo '</table>';
        } else {
            echo '<p>У вас немає подорожі</p>';
        }
    }


} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());

}
?>