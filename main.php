<?php
require_once "includes/config_session.inc.php";
require_once "includes/login.view.inc.php";
require_once "includes/signup.view.inc.php";
?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>EasyRide</title>
    <link href='styles/style.css' rel="stylesheet" type="text/css" />
    <link rel="shortcut icon" href="#">

    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>

    <!-- Leaflet -->
    <link href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>

    <!-- Leaflet Routing Machine -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
    <script src="https://cdn.jsdelivr.net/npm/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>

    <script src="Scripts/script.js" defer></script>


    <script>
        window.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('showLoginForm')) {
                showLoginForm();
            }
        });
    </script>

</head>
<body id="main">
<?php
session_start();

// Проверить, была ли отправлена переменная в POST запросе
if(isset($_POST['GTime'])) {
    $GTime = $_POST['GTime'];
    $selectedPaymentType = $_POST['selectedPaymentType'];
    $selectedTariff = $_POST['selectedTariff'];
    $GStartAddress = $_POST['GStartAddress'];
    $GEndAddress = $_POST['GEndAddress'];
    $TotalDistance = $_POST['TotalDistance'];


    $_SESSION['GTime'] = $GTime;
    $_SESSION['selectedPaymentType'] = $selectedPaymentType;
    $_SESSION['selectedTariff'] = $selectedTariff;
    $_SESSION['GStartAddress'] = $GStartAddress;
    $_SESSION['GEndAddress'] = $GEndAddress;
    $_SESSION['TotalDistance'] = $TotalDistance;
}


//session_start();
//if(isset($_SESSION['selectedTariff'])) {
//    $selectedTariff = $_POST['selectedTariff'];
//
//    $_SESSION['selectedTariff'] = $selectedTariff;
//} else {
//    echo '<p>Variable not set in session</p>';
//}
?>

<?php include 'includes/db.inc.php'; ?>
<header class="cd-main-header">

  <div class="cd-main-header__logo"><a href="main.php"><img src="img/logoWhite.png" alt="Logo" ></a></div>


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
                <a href="Pages/Profile.inc.php">Profile</a>
                <a href="Pages/MyOrder.inc.php">MyOrder</a>
                <a href="Pages/MyHistory.inc.php">MyHistory</a>
                <a href="includes/logout.inc.php">Logout</a>
            </div>
        <?php } ?>

    </ul>
  </nav>

</header>
<div class="cd-signin-modal js-signin-modal"> <!-- this is the entire modal form, including the background -->
  <div class="cd-signin-modal__container"> <!-- this is the container wrapper -->
    <ul class="cd-signin-modal__switcher js-signin-modal-switcher js-signin-modal-trigger">
      <li><a  data-signin="login" data-type="login">Увійти</a></li>
      <li><a  data-signin="signup" data-type="signup">Зареєструватися</a></li>
    </ul>

    <div class="cd-signin-modal__block js-signin-modal-block" data-type="login"> <!-- log in form -->
      <form class="cd-signin-modal__form" action="includes/login.inc.php" method="post">
        <p class="cd-signin-modal__fieldset">
          <label class="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" for="signin-email">Електронна пошта</label>
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signin-email" type="email" name="email" placeholder="Електронна пошта">
          <span class="cd-signin-modal__error">Error message here!</span>
        </p>

        <p class="cd-signin-modal__fieldset">
          <label class="cd-signin-modal__label cd-signin-modal__label--password cd-signin-modal__label--image-replace" for="signin-password">Пароль</label>
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signin-password" type="text" name="pwd" placeholder="Пароль">
          <a  class="cd-signin-modal__hide-password js-hide-password">Сховати</a>
          <span class="cd-signin-modal__error">Error message here!</span>
        </p>

<!--        <p class="cd-signin-modal__fieldset">-->
<!--          <input type="checkbox" id="remember-me" checked class="cd-signin-modal__input ">-->
<!--          <label for="remember-me">Remember me</label>-->
<!--        </p>-->
          <?php
          check_login_errors();
          ?>
        <p class="cd-signin-modal__fieldset">
          <input class="cd-signin-modal__input js-LogIn cd-signin-modal__input--full-width" type="submit" value="Увійти">
        </p>
      </form>

      <p class="cd-signin-modal__bottom-message js-signin-modal-trigger"><a  data-signin="reset">Забули свій пароль?</a></p>
    </div> <!-- cd-signin-modal__block -->

      <!-- SIGN UP -->

    <div class="cd-signin-modal__block js-signin-modal-block" data-type="signup"> <!-- sign up form -->
      <form class="cd-signin-modal__form" action="/includes/signup.inc.php" method="post">
        <p class="cd-signin-modal__fieldset">
          <label class="cd-signin-modal__label cd-signin-modal__label--username cd-signin-modal__label--image-replace" for="signup-username">ПІБ</label>
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-username" type="text" name="pib" placeholder="ПІБ">
          <span class="cd-signin-modal__error">Error message here!</span>
        </p>

        <p class="cd-signin-modal__fieldset">
          <label class="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" for="signup-email">Електронна пошта</label>
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-email" type="email" name="email" placeholder="Електронна пошта">
          <span class="cd-signin-modal__error">Error message here!</span>
        </p>

        <p class="cd-signin-modal__fieldset">
          <label class="cd-signin-modal__label cd-signin-modal__label--phone cd-signin-modal__label--image-replace" for="signup-phone">Номер телефону</label>
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-phone" type="text" name="phone" placeholder="Номер телефону">
          <span class="cd-signin-modal__error">Error message here!</span>
        </p>

        <p class="cd-signin-modal__fieldset">
          <label class="cd-signin-modal__label cd-signin-modal__label--password cd-signin-modal__label--image-replace" for="signup-password">Пароль</label>
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="signup-password" type="text" name="pwd" placeholder="Пароль">
          <a  class="cd-signin-modal__hide-password js-hide-password">Сховати</a>
          <span class="cd-signin-modal__error">Error message here!</span>
        </p>

        <p class="cd-signin-modal__fieldset">
          <input type="checkbox" id="accept-terms" class="cd-signin-modal__input ">
          <label for="accept-terms">Я згоден з <a >Умовами</a></label>
        </p>

          <?php
            check_signup_errors();
          ?>

        <p class="cd-signin-modal__fieldset">
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding" type="submit" value="Створити акаунт">
        </p>
      </form>
    </div> <!-- cd-signin-modal__block -->

    <div class="cd-signin-modal__block js-signin-modal-block" data-type="reset"> <!-- reset password form -->
      <p class="cd-signin-modal__message">Забули пароль? Будь ласка, введіть адресу електронної пошти. Ви отримаєте посилання для створення нового пароля.</p>

      <form class="cd-signin-modal__form">
        <p class="cd-signin-modal__fieldset">
          <label class="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" for="reset-email">Електронна пошта</label>
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding cd-signin-modal__input--has-border" id="reset-email" type="email" placeholder="Електронна пошта">
          <span class="cd-signin-modal__error">Error message here!</span>
        </p>

        <p class="cd-signin-modal__fieldset">
          <input class="cd-signin-modal__input cd-signin-modal__input--full-width cd-signin-modal__input--has-padding" type="submit" value="Скинути пароль">
        </p>
      </form>

      <p class="cd-signin-modal__bottom-message js-signin-modal-trigger"><a  data-signin="login">Назад до входу</a></p>
    </div> <!-- cd-signin-modal__block -->
    <a  class="cd-signin-modal__close js-close">Закрити</a>
  </div> <!-- cd-signin-modal__container -->
</div> <!-- cd-signin-modal -->
<style>
    .autocomplete-suggestions {
        border: 1px solid #ccc;
        max-height: 150px;
        overflow-y: auto;
        position: absolute;
        z-index: 1000;
        background-color: white;
    }

    .autocomplete-suggestion {
        padding: 8px;
        cursor: pointer;
    }

    .autocomplete-suggestion:hover {
        background-color: #e9e9e9;
    }
</style>
<main>
    <div id="map"></div>

    <section id="booking">

    <div id="info-container" style="display: none">
        <div class="column">
            <div class="distance-box">
                <h3>Расстояние до водителя:</h3>
                <p id="distance1">0 км</p>
            </div>
            <div class="time-box">
                <h3>Время до водителя:</h3>
                <p id="time1">0 минут</p>
            </div>
        </div>
        <div class="column">
            <div class="distance-box">
                <h3>Расстояние до <br>точки:</h3>
                <p id="distance2">0 км</p>
            </div>
            <div class="time-box">
                <h3>Время до точки:</h3>
                <p id="time2">0 минут</p>
            </div>
        </div>
        <div class="time-box full-width">
            <h3>Время поездки:</h3>
            <p id="time3">0 минут</p>
        </div>
    </div>


        <form id="booking-form" action="/includes/AddOrder.inc.php" method="POST">
            <div class="s4">
                <h1>Замовлення у м.Одеса</h1>
            </div>
            <div class="input-field" id="input-start-address">
                <input type="text" required spellcheck="false" oninput="debounceCheckAddress(this,'Start')" />
                <label>Звідки</label>
                <div id="suggestions" class="autocomplete-suggestions"></div>
            </div>
            <div class="input-field" id="input-comment">
                <input type="text" required spellcheck="false" />
                <label>Коментар для водія</label>
            </div>
            <div class="input-field" id="input-end-address">
                <input type="text" required spellcheck="false" oninput="debounceCheckAddress(this,'End')"/>
                <label >Куди</label>
                <div id="suggestions" class="autocomplete-suggestions"></div>
            </div>
            <div id="input-time">
                <ul>
                    <li onclick="TimeClick()" class="payment-itemM">
                        <div>
                            <img src="img/cd-time.svg" width="26" height="26"  alt=""/>
                        </div>
                        <div class="text-containerM">
                            <div class="main-textM">Час: <b class="main-textM1" id="outputTime"></b></div>
                        </div>
                    </li>
                </ul>
            </div>
            <div id="payment-method">
                <ul>
                    <li onclick="PaymentTypeClick()" class="payment-itemM">
                        <div>
                            <img src="img/cd-cash.svg" width="26" height="26"  alt=""/>
                        </div>
                        <div class="text-containerM">
                            <div class="main-textM">Спосіб оплати: <b class="main-textM1" id="outputPaymentType"></b></div>
                        </div>
                    </li>
                </ul>
            </div>
            <div id="tariff-typeMain">
                <ul>
                    <li onclick="TariffTypeClick()" class="Tariff-itemM">
                        <div>
                            <img src="img/CarStandard.png" alt=""/>
                        </div>
                        <div class="TariffText-containerM">
                            <div class="TariffMain-textM2">Класс: <b class="TariffMain-textM22" id="outputTariffType"></b><b id="outputTariffCost" class="costTariffM2"></b></div>
                        </div>
                    </li>
                </ul>
            </div>
            <div id="order-button">
                <button type="submit" onclick="GetV">Замовити таксі</button>
            </div>
        <!-- Time -->
        <div>
            <ul id="Timet" style="display: none">
                <div class="radio" onclick="TimeSelect('Now')">
                    <input id="radio-1" name="radio" type="radio" checked>
                    <label for="radio-1" class="radio-label">на зараз</label>
                </div>

                <div class="radio" onclick="TimeSelect('In15Min')">
                    <input id="radio-2" name="radio" type="radio">
                    <label  for="radio-2" class="radio-label">через 15 хвилин</label>
                </div>

                <div class="radio" onclick="TimeSelect('In30Min')">
                    <input id="radio-3" name="radio" type="radio">
                    <label  for="radio-3" class="radio-label">через 30 хвилин</label>
                </div>

                <div class="radio" onclick="TimeSelect('In60Min')">
                    <input id="radio-4" name="radio" type="radio">
                    <label  for="radio-4" class="radio-label">через годину</label>
                </div>

                <div class="radio" onclick="TimeSelect('SetTime')">
                    <input id="radio-5" name="radio" type="radio">
                    <label  for="radio-5" class="radio-label">на вказаний час</label>
                </div>
                <div class="yNCj7">
                    <div>
                        <span class="Arrow" onclick="incrementValue('TimeHours')"><img src="img/cd-up.svg" style="height: 32px; width: 32px" alt=""></span>
                        <div class="XP9P4 _1ZyjV _12IIa">
                            <label class="_3BCF2" for=""></label>
                            <input type="text" pattern="[0-9]*" id="TimeHours" value="00" oninput="checkHours(this)">
                            <span class="_2Du04"></span>
                        </div>
                        <span class="Arrow" onclick="decrementValue('TimeHours')"><img src="img/cd-down.svg" style="height: 32px; width: 32px" alt=""></span>
                    </div><div class="Сolon">:</div>
                    <div>
                        <span class="Arrow" onclick="incrementValue('TimeMin')"><img src="img/cd-up.svg" style="height: 32px; width: 32px" alt=""></span>
                        <div class="_18_rz _1ZyjV _12IIa"><label class="_3BCF2" for=""></label>
                            <input type="text" pattern="[0-9]*" id="TimeMin" value="00" oninput="checkMinutes(this)">
                            <span class="_2Du04"></span>
                        </div>
                        <span class="Arrow" onclick="decrementValue('TimeMin')"><img src="img/cd-down.svg" style="height: 32px; width: 32px" alt=""></span>
                    </div>
                </div>
                <div id="back-button_Time" style="display: none">
                    <button type="button" onclick="TimeShow()">
                        Назад
                    </button>
                </div>
            </ul>
        </div>
        <!-- PaymentType -->
        <div>
            <ul>
                <li onclick="PaymentTypeSelect('Cash')" id="payment-typeCash" class="payment-item">
                    <div>
                        <img src="img/cd-cash.svg" alt=""/>
                    </div>
                    <div class="text-container">
                        <div id="payment-typeCashMain" class="main-text">Готівка</div>
                        <div id="payment-typeCashSecond" class="secondary-text">Оплата водієві по закінченню поїздки</div>
                    </div>
                </li>

                <li onclick="PaymentTypeSelect('Card')" id="payment-typeCard" class="payment-item">
                    <div>
                        <img src="img/cd-card.svg" alt="" style="line-height: 1;"/>
                    </div>
                    <div class="text-container">
                        <div id="payment-typeCardMain" class="main-text">Картою</div>
                        <div id="payment-typeCardSecond" class="secondary-text">Оплата водієві в кінці поїздки</div>
                    </div>
                </li>

                <div id="back-button_payment" style="display: none">
                    <button type="button" onclick="PaymentTypeShow()">
                        Назад
                    </button>
                </div>
            </ul>
        </div>
        <!-- TariffType -->
        <div>
            <ul>
                <li class="Tariff-itemS" onclick="TariffSelect('Delivery')" id="tariff-typeDelivery">
                    <div class="text-containerS">
                        <img id ="scooter" src="img/Scooter2.png"  alt=""/>
                        <div class="main-textS">Доставка</div>
                        <div class= "secondary-textS">60.00₴</div>
                    </div>
                </li>
                <li class="Tariff-itemS" onclick="TariffSelect('Standard')" id="tariff-typeStandard">
                    <div class="text-containerS">
                        <img src="img/CarStandard.png"  alt=""/>
                        <div class="main-textS">Стандарт</div>
                        <div class= "secondary-textS">80.00₴</div>
                    </div>
                </li>
                <li class="Tariff-itemS" onclick="TariffSelect('Comfort')" id="tariff-typeComfort">
                    <div class="text-containerS">
                        <img src="img/CarComfort.png"  alt=""/>
                        <div class="main-textS">Комфорт</div>
                        <div class= "secondary-textS">100.00₴</div>
                    </div>
                </li>
                <li class="Tariff-itemS" onclick="TariffSelect('Minibus')" id="tariff-typeMinibus">
                    <div class="text-containerS">
                        <img src="img/CarMinibus.png"  alt=""/>
                        <div class="main-textS">Мінівен</div>
                        <div class= "secondary-textS">140.00₴</div>
                </li>
                <li class="Tariff-itemS" onclick="TariffSelect('Business')" id="tariff-typeBusiness">
                    <div class="text-containerS">
                        <img src="img/CarBusiness.png"  alt=""/>
                        <div class="main-textS">Бизнес</div>
                        <div class= "secondary-textS">160.00₴</div>
                </li>
                <div id="back-button_tariff" style="display: none">
                    <button type="button" onclick="TariffTypeShow()">Назад</button>
                </div>
            </ul>
        </div>
    </form>
  </section>
</main>
</body>
</html>
