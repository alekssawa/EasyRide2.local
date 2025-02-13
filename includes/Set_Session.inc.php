<?php
if (isset($_SESSION['client_id'])) {
    $payment_date = $_POST['payment_date'];

    if (isset($_SESSION['Date'])) {

// Устанавливаем значение в сессию
        $_SESSION['Date'] = $payment_date;

    // Возвращаем какой-либо ответ на клиент
        echo 'Данные успешно установлены в сессии';
    }
}

?>