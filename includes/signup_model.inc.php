<?php

declare(strict_types=1);

function get_email(object $pdo, string $email)
{
    $query = "SELECT * FROM clients WHERE client_email = :client_email;";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(":client_email", $email);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result;
}

function set_client(object $pdo, string $pib, string $email, string $pwd, string $phone)
{
    $query = "INSERT INTO clients (client_p_i_b, client_phone_number, client_email, client_pwd) VALUES 
    (:pib,:phone,:email, :pwd)";
    $stmt = $pdo->prepare($query);

    $options =[
        'cost' => 12
    ];

    $hashedPwd = password_hash($pwd, PASSWORD_DEFAULT, $options);

    $stmt->bindParam(':pib', $pib);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':pwd', $hashedPwd);
    $stmt->execute();
}
?>