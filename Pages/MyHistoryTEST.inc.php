<?php
global $orders;
require_once "../includes/config_session.inc.php";
require_once "../includes/login.view.inc.php";
require_once "../includes/signup.view.inc.php";

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>EasyRide</title>
    <link href='../styles/style.css' rel="stylesheet" type="text/css" />
    <link href='../styles/MyHistotyTest.css' rel="stylesheet" type="text/css" />
    <script src="../Scripts/script.js" defer></script>
    <script src="../Scripts/MyHistotyTest.js" defer></script>
</head>
<body id="profile">
<?php include '../includes/db.inc.php'; ?>
<header class="cd-main-header">
    <div class="cd-main-header__logo"><a href="../main.php"><img src="../img/logoWhite.png" alt="Logo" ></a></div>
    <nav class="cd-main-nav js-main-nav">

        <ul class="cd-main-nav__list js-signin-modal-trigger">

            <!-- inser more links here -->
            <?php if(!isset($_SESSION["user_id"])){ ?>
                <li><a class="cd-main-nav__item cd-main-nav__item--signin"  data-signin="login">Увійти</a></li>
                <li><a class="cd-main-nav__item cd-main-nav__item--signup"  data-signin="signup">Зареєструватися</a></li>

            <?php } ?>
            <?php if(isset($_SESSION["user_id"])){ ?>

            <div class="dropdown">
                <button class="dropbtn"><?php output_pib();?>
                    <i class="fa fa-caret-down"></i>
                </button>
                <div class="dropdown-content">
                    <?php include '../includes/List_pages.inc.php';?>
                </div>
                <?php } ?>
        </ul>
    </nav>
</header>
<?php require_once "../includes/History_contrTEST.inc.php";?>

<div class="container">

<?php require_once "../includes/Driver_info.inc.php";?>

<?php foreach ($orders as $order): ?>
    <div class="order" onclick="toggleDetails(this)">
        <div class="order-header">
            <div class="route-wrapper">
                <img src="../img/IconTripHistoryDarker.png" alt="Маршрут" class="route-icon">
                <div class="route">
                    <div class="start_location">
                        <span><?= htmlspecialchars(implode(', ', array_slice(explode('-', $order['start_location']), 0, 2))) ?></span>
                        <span>Початок маршруту</span>
                    </div>
                    <br>
                    <div class="destination">
                        <span><?= htmlspecialchars(implode(', ', array_slice(explode('-', $order['destination']), 0, 2))) ?></span>
                        <span>Пункт призначення</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="order-details">
            <div class="line-with-text">DETAILS</div>
            <div class="order-details-driver">
                <div class="profile-driver">
                    <span><?= htmlspecialchars($order['driver']) ?></span>
                    <span>Driver
                        <img src="../img/Star_rating.png" style="width: 10px; height: auto; display: inline-block;" alt="">
                        <?= htmlspecialchars($order['average_rating']) ?>
                    </span>
                </div>
                <div class="car-driver">
                    <span class="model"><?= htmlspecialchars($order['car_model'] ?? 'Неизвестно') ?></span>
                    <span class="plate"><?= htmlspecialchars($order['car_registration_plate'] ?? 'Неизвестно') ?></span>
                </div>
            </div>
            <div class="order-info">
                <div>
                    <span class="first">Тариф:</span>
                    <span class="second"> <?= htmlspecialchars($order['tariff']) ?></span>
                    <span class="first">Дата:</span>
                    <span class="second"><?= date("d.m.Y H:i", strtotime($order['start_time'])) ?></span>
                </div>
                <div>
                    <span class="first">Дальність подорожі:</span>
                    <span class="second">0 км</span> <!-- <?= number_format($order['distance_km'], 1, ',', ' ') ?>--->
                    <span class="first">Тривалість подорожі:</span>
                    <span class="second"><?= intval((strtotime(explode('.', $order['end_time'])[0]) - strtotime(explode('.', $order['start_time'])[0])) / 60) ?> мин</span>
                </div>
                <div>
                    <span class="first">Тип оплати:</span>
                    <span class="second"><?= htmlspecialchars($order['payment_type']) ?></span>
                    <span class="first">Вартість проїзду:</span>
                    <span class="second"><?= number_format($order['amount'], 2, ',', ' ') ?> ₴</span>
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>
</body>
</html>
