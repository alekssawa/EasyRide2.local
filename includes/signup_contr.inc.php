<?php

declare(strict_types=1);

function is_input_empty(string $pib, string $phone, string $email, string $pwd)
{
    if (empty($pib) || empty($phone) || empty($email) || empty($pwd)){
        return true;
    } else {
        return false;
    }
}

function is_email_invalid(string $email): bool
{
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
        return true;
    } else{
        return false;
    }
}

function is_email_registered(object $pdo, string $email): bool
{
    if(get_email($pdo, $email)){
        return true;
    } else{
        return false;
    }
}

function is_username_wrong(bool|array $result)
{
    if(!$result)
    {
        return true;
    } else {
        return false;
    }
}

function is_password_wrong(string $pwd, string $hashedPwd)
{
    if(!password_verify($pwd, $hashedPwd)){
        return true;
    } else {
        return false;
    }
}

function create_client(object $pdo, string $pib, string $email, string $pwd, string $phone)
{
    set_client($pdo,  $pib,  $email,  $pwd, $phone);
}

?>