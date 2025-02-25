<?php
try {
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }
    if($_SESSION["user_status"] == "Client") {
        $stmt = $pdo->prepare('SELECT trip_id as id, drivers.driver_p_i_b as driver, tariffs.tariff_name as tariff, payment_amount as amount, 
       trip_payment_type as payment_type, trip_start_time as start_time, trip_end_time as end_time, trip_client_start_location as start_location, trip_client_destination  as destination
        FROM triphistory
        JOIN tariffs ON triphistory.trip_tariff_id = tariffs.tariff_id
        JOIN drivers ON triphistory.trip_driver_id = drivers.driver_id
        JOIN payments ON triphistory.trip_payment_id = payments.payment_id
        WHERE trip_client_id = :trip_client_id;');

        $stmt->bindParam(":trip_client_id", $_SESSION["user_id"]);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);



    } elseif ($_SESSION["user_status"] == "Driver"){

        $stmt = $pdo->prepare('SELECT trip_id as id, clients.client_p_i_b as client, tariffs.tariff_name as tariff, payment_amount as amount,
       trip_payment_type as payment_type, trip_start_time as start_time, trip_end_time as end_time, trip_client_start_location as start_location, trip_client_destination  as destination
        FROM triphistory
        JOIN tariffs ON triphistory.trip_tariff_id = tariffs.tariff_id
        JOIN clients ON triphistory.trip_client_id = clients.client_id
        JOIN payments ON triphistory.trip_payment_id = payments.payment_id
        WHERE trip_driver_id = :trip_driver_id;');

        $stmt->bindParam(":trip_driver_id", $_SESSION["user_id"]);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);


    }


} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());

}
?>