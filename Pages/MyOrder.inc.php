<?php
require_once "../includes/config_session.inc.php";
require_once "../includes/login.view.inc.php";
require_once "../includes/signup.view.inc.php";
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <title>EasyRide</title>
    <link href='../styles/style.css' rel="stylesheet" type="text/css"/>
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
            <?php if (isset($_SESSION["user_id"])){ ?>

            <div class="dropdown">
                <button class="dropbtn"><?php output_pib(); ?>
                    <i class="fa fa-caret-down"></i>
                </button>
                <div class="dropdown-content">
                    <?php include '../includes/List_pages.inc.php'; ?>
                </div>
                <?php } ?>
        </ul>
    </nav>
</header>
<style>
    /* Стили для скругленной плашки */
    .info-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 600px;
        margin: 20px auto;
    }

    .info-box {


        .info-item {
            flex-grow: 1; /* Занимает всю доступную ширину */
            margin-right: 20px; /* Отступ справа */
        }

        .content-table {
            border-collapse: collapse;
            font-size: 20px;
            margin: 25px 0;
            min-width: 400px;
            border-radius: 5px 5px 0 0;
            overflow: hidden;
            box-shadow: 0 0 10px rgb(0, 0, 0.15);
        }

        .content-table thead tr {
            background-color: #009879;
            color: white;
            text-align: center;
            font-weight: bold;
        }

        .content-table th {
            border: 1px solid #009879; /* Задаем толщину, стиль и цвет вертикальных границ */
            text-align: center;
            padding: 12px 15px;
        }
    }

    .content-table td {
        text-align: center;
        border: 1px solid #009879;
        padding: 12px 15px;
    }

    .content-table tbody tr:last-of-type {
        border-bottom: 3px solid #009879;
        text-align: center;

    }

    /*.info-item th,td{*/
    /*    border: 1px solid grey;*/
    /*    text-align:center;*/
    /*    font-family: "Montserrat", sans-serif;*/
    /*    font-weight: bold;*/
    /*    border-collapse: collapse;*/
    /*    font-size: 0.9em;*/
    /*}*/


    /*.info-item table{*/
    /*    border-collapse: collapse;*/
    /*    margin: 25px 0;*/
    /*    min-width: 400px;*/
    /*}*/
    .info-box p {
        text-align: center;
        font-family: "Montserrat", sans-serif;
        font-weight: bold;
        font-size: 20px;
    }

    .info-label {
        font-weight: bold;
    }

    .rounded-image {
        border-radius: 50%;
        width: 150px;
        height: 150px;
    }
</style>

<div class="info-container">
    <div class="info-box">
        <div class="info-item">
            <?php require_once "../includes/Order_contr.inc.php"; ?>
            <?php require_once "../includes/OrderCheck.inc.php"; ?>
        </div>
    </div>
</div>
</body>
</html>
