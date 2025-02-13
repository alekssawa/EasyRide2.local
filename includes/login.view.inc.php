<?php
declare (strict_types=1);

function output_email()
{
    if(isset($_SESSION["user_id"])) {
        echo $_SESSION["user_email"];
    } else {
        echo "You are not logged in";
    }
}
function output_pib()
{
    if(isset($_SESSION["user_id"])) {
        echo $_SESSION["user_pib"];
    } else {
        echo "You are not logged in";
    }
}
function output_status()
{
    if(isset($_SESSION["user_id"])) {
        echo '<span style="color: green; font-weight: bold">' . $_SESSION["user_status"] . '</span>';
    } else {
        echo "You are not logged in";
    }
}
function output_phone()
{
    if(isset($_SESSION["user_id"])) {
        echo $_SESSION["user_phone"];
    } else {
        echo "You are not logged in";
    }
}
function check_login_errors()
{
    if (isset($_SESSION["errors_login"])) {
        $errors = $_SESSION["errors_login"];

        echo "<br>";

        foreach ($errors as $error) {
            echo '<p class="form-error">' . $error . '</p>';
            }
    unset($_SESSION['errors_login']);
    }
    else if (isset($_GET['login']) && $_GET['login'] === "success") {
    }
}
?>