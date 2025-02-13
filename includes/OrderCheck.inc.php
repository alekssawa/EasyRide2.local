<?php


try {
    require_once "../includes/config_session.inc.php";
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    echo '<script src="../Scripts/script.js" defer></script>';

    $order_status_in_progress = "In progress";

    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }

    if(isset($_SESSION["user_id"])) {
        if ($_SESSION["user_status"] === "Client")
        {
            $sql = "SELECT 1 FROM orders WHERE order_client_id = :client_id AND order_order_status = :order_status_in_progress LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':client_id', $_SESSION["user_id"], PDO::PARAM_INT);
            $stmt->bindParam(":order_status_in_progress", $order_status_in_progress);
            $stmt->execute();
            if ($stmt->rowCount() != 0) {
                echo '<div class="button-container">
                            <form action="../includes/CanceledOrder.inc.php" method="post">
                                <button class="buttonComplete" type="submit" name="canceled_order">Отменить поездку</button>
                            </form>
                        </div>';
            }

        }elseif ($_SESSION["user_status"] === "Driver")
        {
            $sql = "SELECT 1 FROM orders WHERE order_driver_id = :driver_id AND order_order_status = :order_status_in_progress LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':driver_id', $_SESSION["user_id"], PDO::PARAM_INT);
            $stmt->bindParam(":order_status_in_progress", $order_status_in_progress);
            $stmt->execute();

            if ($stmt->rowCount() != 0) {
                echo '<div class="button-container">
                            <form action="../includes/CanceledOrder.inc.php" method="post">
                                <button class="buttonComplete" type="submit" name="canceled_order">Отменить поездку</button>
                            </form>
                            <form action="../includes/CompeleteOrder.inc.php" method="post">
                                <button class="buttonComplete buttonComplete-right" type="submit" name="complete_order">Завершить поездку</button>
                            </form>
                        </div>';

            }


        }


    }

    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage());

    }
?>