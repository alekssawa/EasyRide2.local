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
    <link href='../styles/Profile.css' rel="stylesheet" type="text/css" />

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

    <?php
    if (!isset($_SESSION["user_status"])) {
        header("Location: ../main.php");
        exit();
    }
    ?>

    <!-- TODO: Переделать дизайн -->
    <!-- TODO: Реализовать систему хранение аватарок -->

    <div class="info-container">
        <?php require_once "../includes/Profile_contr.inc.php"; ?>
        <!-- <?php print_r($order) ?> -->

    </div>
</body>

</html>