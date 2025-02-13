<?php
if($_SERVER["REQUEST_METHOD"] == "POST"){
    $pib = $_POST["pib"];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $pwd = $_POST['pwd'];


    try {
        if (!isset($pdo)) {
            echo ("ERROR DATABASE CONNECTION");
        }
        require_once 'E:/!ССЫЛКА НА ПАПКУ!/Лабы/WEB/includes/db.inc.php';
        require_once 'E:/!ССЫЛКА НА ПАПКУ!/Лабы/WEB/includes/signup_model.inc.php';
        require_once 'E:/!ССЫЛКА НА ПАПКУ!/Лабы/WEB/includes/signup_contr.inc.php';

        $errors = [];

        if (!isset($pdo)) {
            echo ("ERROR DATABASE CONNECTION");
        }

        if (is_input_empty($pib, $phone, $email, $pwd)) {
            $errors["empty_input"] = "Fill in all the fields";
        }

        if (is_email_invalid($email)) {
            $errors["email_invalid"] = "Email address is invalid";
        }

        if (is_email_registered($pdo, $email)) {
            $errors["email_used"] = "Email already registered!";
        }

        require_once 'config_session.inc.php';

        if ($errors) {
            $_SESSION["errors_signup"] = $errors;

            $signupData = [
                "email" => $email
            ];

            $_SESSION["signup_data"] = $signupData;
            header("Location: ../main.php");
            die();
        }
        create_client($pdo, $pib, $email, $pwd, $phone);

        header("Location: ../main.php?signup=success");

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