<?php
require_once "../includes/config_session.inc.php";
require_once "../includes/login.view.inc.php";
require_once "../includes/signup.view.inc.php";


$orders = [
    ["from" => "ул. Ленина, 10", "to" => "пр. Победы, 25", "date" => "2024-02-24", "price" => "350 $", "status" => "Завершен", "comment" => "Безналичный расчет"],
    ["from" => "аэропорт", "to" => "гостиница 'sdadsd'", "date" => "2024-02-23", "price" => "1200 $", "status" => "Завершен", "comment" => "Встреча с табличкой"],
    ["from" => "ТРЦ 'Галерея'", "to" => "домой", "date" => "2024-02-22", "price" => "450 $", "status" => "Отменен", "comment" => "Долгое ожидание"],
];

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>EasyRide</title>
    <link href='../styles/style.css' rel="stylesheet" type="text/css" />
    <script src="../Scripts/script.js" defer></script>
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
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .order {
            background: white;
            border-radius: 12px;
            padding: 15px;
            margin: 10px auto;
            max-width: 400px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .order:hover {
            box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
        }
        .order-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
        }
        .order-details {
            margin-top: 10px;
            display: none;
        }
        .expanded {
            background: #eef4ff;
        }

        .route {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 16px;
            font-weight: bold;
        }
        .arrow {
            font-size: 20px;
            color: #007bff;
            margin: 5px 0;
        }
}
    </style>

<div class="container">
    <?php foreach ($orders as $order): ?>
        <script>
            console.log(<?= json_encode($order['start_location'], JSON_UNESCAPED_UNICODE) ?>);
            getDetails2(<?= json_encode($order['start_location'], JSON_UNESCAPED_UNICODE) ?>);

        </script>
        <div class="order" onclick="toggleDetails(this)">
            <div class="order-header">
                <div class="route">
                    <span><?= htmlspecialchars($order['start_location']) ?></span>
                    <span class="arrow">↓</span>
                    <span><?= htmlspecialchars($order['destination']) ?></span>
                </div>
            </div>
            <div class="order-details">
                <p><strong>Водитель:</strong> <?= htmlspecialchars($order['driver']) ?></p>
                <p><strong>Тариф:</strong> <?= htmlspecialchars($order['tariff']) ?></p>
                <p><strong>Дата:</strong> <?= date("d.m.Y H:i", strtotime($order['start_time'])) ?></p>
                <p><strong>Сумма:</strong> <?= number_format($order['amount'], 2, ',', ' ') ?> ₴</p>
                <p><strong>Оплата:</strong> <?= htmlspecialchars($order['payment_type']) ?></p>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<script>

    // fetch(`https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=1223544492&addressdetails=1&format=json`)
    //     .then(response => response.json())
    //     .then(details => {
    //         console.log(details.names["name:uk"]);
    //         console.log(details);
    //     })
    //     .catch(error => {
    //         console.error('Ошибка при получении деталей:', error);
    //     });

    function toggleDetails(orderElement) {
        const details = orderElement.querySelector('.order-details');
        const isOpen = details.style.display === "block";

        document.querySelectorAll('.order-details').forEach(el => el.style.display = "none");
        document.querySelectorAll('.order').forEach(el => el.classList.remove('expanded'));

        if (!isOpen) {
            details.style.display = "block";
            orderElement.classList.add('expanded');
        }
    }
</script>
</body>
</html>
