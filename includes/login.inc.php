<?php
if($_SERVER["REQUEST_METHOD"] == "POST"){
    $email = $_POST['email'];
    $pwd = $_POST['pwd'];

    try {
        require_once '../includes/db.inc.php';
        require_once '../includes/login_model.inc.php';
        require_once '../includes/login_contr.inc.php';

        $errors = [];

        $user_id = "";
        $user_email = "";
        $user_pib = "";
        $user_phone = "";
        $user_pwd = "";



        if (!isset($pdo)) {
            echo ("ERROR DATABASE CONNECTION");
        }

        if (is_input_empty($email, $pwd)) {
            $errors["empty_input"] = "Fill in all the fields";
        }

        list($result, $us_status) = get_user($pdo, $email);

        if ($us_status == "Client") {
            $user_id = "client_id";
            $user_email = "client_email";
            $user_pib = "client_p_i_b"; // Исправьте здесь имя поля, если оно отличается
            $user_phone = "client_phone_number";
            $user_pwd = "client_pwd";
        } elseif ($us_status == "Driver") {
            $user_id = "driver_id";
            $user_email = "driver_email";
            $user_pib = "driver_p_i_b";
            $user_phone = "driver_phone_number";
            $user_pwd = "driver_pwd";
        } elseif ($us_status == "Administrator") {
            $user_id = "admin_id";
            $user_email = "admin_email";
            $user_pib = "admin_p_i_b";
            $user_phone = "admin_phone_number";
            $user_pwd = "admin_pwd";
        }

        if (is_email_wrong($result)) {
            $errors["login_incorrect"] = "Incorrect login info!";
        } elseif (!is_email_wrong($result) && is_password_wrong($pwd, $result[$user_pwd])) {
            $errors["login_incorrect"] = "Incorrect login info!";
        }

        require_once 'config_session.inc.php';

        if ($errors) {
            $_SESSION["errors_login"] = $errors;

            header("Location: ../main.php");
            die();
        }
        $newSessionId = session_create_id();
        $sessionId = $newSessionId. "_" . $result["user_id"];
        session_id($sessionId);

        if ($_SESSION["user_status"] == "Client") {
            $user_id = "client_id";
            $user_email = "client_email";
            $user_pib = "client_pib";
            $user_phone = "client_phone_number";
            $user_pwd = "client_pwd";
        }

        $_SESSION["user_id"] = $result[$user_id];
        $_SESSION["user_status"] = $us_status;
        $_SESSION["user_email"] = htmlspecialchars($result[$user_email]);
        $_SESSION["user_pib"] = htmlspecialchars($result[$user_pib]);
        $_SESSION["user_phone"] = htmlspecialchars($result[$user_phone]);

        echo '<p>You are logged in as ' . $_SESSION["user_email"] . '</p>';

        $_SESSION["last_regeneration"] = time();
        //echo $_SESSION["user_id"];
        header("Location: ../main.php?login=success");
        $pdo = null;
        $statement = null;

        die();

    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage());

    }
} else {
    header("location: ../main.php");
    die();
}

?>