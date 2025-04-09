<?php
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
    <script src="../Scripts/script.js" defer></script>
</head>

<body id="profile">
    <?php include '../includes/db.inc.php'; ?>
    <header class="cd-main-header">
        <div class="cd-main-header__logo"><a href="../main.php"><img src="../img/logoWhite.png" alt="Logo"></a></div>
        <nav class="cd-main-nav js-main-nav">

            <ul class="cd-main-nav__list js-signin-modal-trigger">

                <!-- inser more links here -->
                <?php if (!isset($_SESSION["user_id"])) { ?>
                    <li><a class="cd-main-nav__item cd-main-nav__item--signin" data-signin="login">Увійти</a></li>
                    <li><a class="cd-main-nav__item cd-main-nav__item--signup" data-signin="signup">Зареєструватися</a></li>

                <?php } ?>

                <?php if (isset($_SESSION["user_id"])) { ?>
                    <div class="dropdown">

                        <button class="dropbtn"><?php output_pib(); ?>
                            <i class="fa fa-caret-down"></i>
                        </button>
                        <div class="dropdown-content">
                            <?php include '../includes/List_pages.inc.php'; ?>
                        </div>
                    </div>
                <?php } ?>
            </ul>
        </nav>
    </header>
    <style>
        .info-container {
            display: flex;
            align-items: center;
            width: 520px;
            margin: 20px auto;
        }

        .info-container2 {
            display: flex;
            align-items: center;
            width: 350px;
            margin: 20px 845px;
        }

        .info-box {
            background-color: #f0f0f0;
            border-radius: 10px;
            padding: 20px;
            flex-grow: 1;
            margin-left: 20px;
        }

        .info-box2 {
            background-color: #f0f0f0;
            border-radius: 10px;
            padding: 20px;
            flex-grow: 1;
            margin-left: 20px;
        }

        .info-item {
            margin-bottom: 10px;
        }

        .info-label {
            font-weight: bold;
        }

        .rounded-image {
            border-radius: 50%;
            width: 150px;
            height: 150px;
        }

        .info-row {
            display: flex;
            align-items: center;
        }

        .info-detail {
            display: flex;
            align-items: center;
            white-space: nowrap;
            /* Prevents line breaks */
        }

        .info-detail p {
            white-space: normal;
        }

        .rating-container {
            margin-left: 20px;
            white-space: nowrap;
            /* Prevents line breaks */
        }
    </style>
    <!-- TODO: Переделать дизайн -->
    <!-- TODO: Реализовать систему хранение аватарок -->
    <div class="info-container">
        <img src="../img/map2.png" alt="Фото" class="rounded-image">
        <div class="info-box">
            <?php if ($_SESSION["user_status"] != "Client") { ?>
                <div class="info-item">
                    <span class="info-label">Status:</span> <?php output_status(); ?>
                </div>
            <?php } ?>
            <div class="info-item info-row">
                <div class="info-detail">
                    <span class="info-label">ФИО:</span>&nbsp; <?php output_pib(); ?>
                </div>
                <?php if ($_SESSION["user_status"] == "Driver") { ?>
                    <div class="rating-container">
                        <?php require_once "../includes/Driver_reviews.inc.php"; ?><img src="../img/Star_rating.png" style="width: 20px; height: auto; display: inline-block; vertical-align: middle;" alt="">
                    </div>
                <?php } ?>
            </div>
            <div class="info-item">
                <span class="info-label">Телефон:</span> <?php output_phone(); ?>
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span> <?php output_email(); ?>
            </div>
        </div>
    </div>
    <?php if ($_SESSION["user_status"] == "Driver") { ?>
        <div class="info-container2">
            <div class="info-box2">
                <div class="info-item info-row">
                    <div class="info-detail2">
                        <?php require_once "../includes/Driver_car.inc.php"; ?>
                    </div>
                </div>
            </div>
        <?php } ?>
</body>

</html>