<?php

declare(strict_types=1);
function get_user(object $pdo, string $email)
{
    $query = "SELECT * FROM clients WHERE client_email = :client_email;";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(":client_email", $email);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $us_status = "";
    if ($result) {
        //$_SESSION["user_status"] = "Client";
        $us_status = "Client";
    } else {
        $query = "SELECT * FROM drivers WHERE driver_email = :driver_email;";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(":driver_email", $email);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $us_status = "Driver";
        }
    }

    return [$result, $us_status];
}
?>