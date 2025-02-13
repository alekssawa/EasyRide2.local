let StreetEn;
let HouseNumber;
let GStartAddress;
let GEndAddress;

let RoutingPoints = [[], []];

let selectedRadioTime = "Now";
let GTime;
let selectedTariff = "Standard";
let selectedPaymentType = "Cash";
let TimeDictionaryText = {
    "Now": "на зараз",
    "In15Min": "через 15 хвилин",
    "In30Min": "через 30 хвилин",
    "In60Min": "через годину",
};

let tariffDictionary = {
    "Delivery": "Доставка",
    "Standard": "Стандарт",
    "Comfort": "Комфорт",
    "Minibus": "Мінівен",
    "Business": "Бизнес"
};
let PaymentTypeDictionary = {
    "Cash": "Готівка",
    "Card": "Картою"
};
let tariffCost = {
    "Delivery": "60",
    "Standard": "80",
    "Comfort": "100",
    "Minibus": "140",
    "Business": "160"
};
function setSession(){
    $.post("../includes/test.inc.php", {"img": selectedRadioTime});
}

function refrechValue(){
    $.ajax({
        url: 'main.php',
        method: 'POST',
        data: {
            GTime: GTime,
            selectedPaymentType: selectedPaymentType,
            selectedTariff: selectedTariff,
            GStartAddress: GStartAddress,
            GEndAddress: GEndAddress
        },
        success: function(response) {
            console.log('Variable saved in session');
        }
    });

}



refrechValue()

if (document.getElementById("outputTariffType")) document.getElementById("outputTariffType").textContent = tariffDictionary[selectedTariff];
if (document.getElementById("outputTariffCost")) document.getElementById("outputTariffCost").textContent = tariffCost[selectedTariff] + "₴";

// Изменение стилей для элемента с id `tariff-type${selectedTariff}`
if (document.getElementById(`tariff-type${selectedTariff}`)) {
    document.getElementById(`tariff-type${selectedTariff}`).style.backgroundColor = "#dcffe0";
    document.getElementById(`tariff-type${selectedTariff}`).style.color = "#17551E";
}

// Установка текстового содержимого для элемента с id "outputPaymentType"
if (document.getElementById("outputPaymentType")) document.getElementById("outputPaymentType").textContent = PaymentTypeDictionary[selectedPaymentType];

// Изменение стилей для элемента с id `payment-type${selectedPaymentType}`
if (document.getElementById(`payment-type${selectedPaymentType}`)) document.getElementById(`payment-type${selectedPaymentType}`).style.backgroundColor = "#dcffe0";

// Изменение стилей для элементов с id `payment-type${selectedPaymentType}Main` и `payment-type${selectedPaymentType}Second`
if (document.getElementById(`payment-type${selectedPaymentType}Main`) && document.getElementById(`payment-type${selectedPaymentType}Second`)) {
    document.getElementById(`payment-type${selectedPaymentType}Main`).style.color = "#008c52";
    document.getElementById(`payment-type${selectedPaymentType}Main`).style.fontWeight = "bold";
    document.getElementById(`payment-type${selectedPaymentType}Second`).style.color = "#00a68d";
    document.getElementById(`payment-type${selectedPaymentType}Second`).style.fontWeight = "normal";
}

if (document.getElementById("outputTime")) {
    if (selectedRadioTime !== "SetTime") {
        document.getElementById("outputTime").textContent = TimeDictionaryText[selectedRadioTime];
    } else if (selectedRadioTime === "SetTime") {
        document.getElementById("outputTime").textContent = GetTimeValue("SetTime")[3];
    }
}

function checkHours(input) {
    let value = parseInt(input.value);
    if (value > 24) {
        input.value = "24";
    }
}

function checkMinutes(input) {
    let value = parseInt(input.value);
    if (value > 59) {
        input.value = "59";
    }
}


function incrementValue(id) {
    const input = document.getElementById(id);
    let value = parseInt(input.value, 10);
    if (!isNaN(value)) {
        if (id === 'TimeHours') {
            // Ограничение для часов (0-24)
            value = (value >= 0 && value < 24) ? value + 1 : 0;
        } else if (id === 'TimeMin') {
            // Ограничение для минут (0-59)
            value = (value >= 0 && value < 59) ? value + 1 : 0;
        }
        input.value = value < 10 ? '0' + value : value;
    }

}

function decrementValue(id) {
    const input = document.getElementById(id);
    let value = parseInt(input.value, 10);
    if (!isNaN(value) && value > 0) {
        value--;
        input.value = value < 10 ? '0' + value : value;
    }

}

function GetTimeValue(time) {
    let currentDate = new Date();
    let TimeDictionary = {
        "Now": 0,
        "In15Min": 15,
        "In30Min": 30,
        "In60Min": 60,
    };
    let Hour = document.getElementById('TimeHours').value;
    let Minute = document.getElementById('TimeMin').value;

    if (time !== "SetTime") {
        currentDate.setMinutes(currentDate.getMinutes() + TimeDictionary[time]);
    } else {
        currentDate.setHours(Hour);
        currentDate.setMinutes(Minute);
    }

    let monthsDict = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    let daysOfWeek = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth()
    let monthName = monthsDict[month];
    let daysOfWeekName = daysOfWeek[currentDate.getDay()];
    let date = currentDate.getDate();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();
    month = month < 10 ? '0' + month : month;
    date = date < 10 ? '0' + date : date;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    let fullTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    let TimeString = hours + ":" + minutes + ", " + date + " " + monthName + ", " + daysOfWeekName;

    let result = fullTime;

    return [result, hours, minutes, TimeString];
}

function TimeSelect(time) {
    selectedRadioTime = time;
    GTime = GetTimeValue(time)[0]
    if (selectedRadioTime !== "SetTime") {
        document.getElementById("outputTime").textContent = TimeDictionaryText[selectedRadioTime];
    } else if (selectedRadioTime === "SetTime") {
        document.getElementById("outputTime").textContent = GetTimeValue("SetTime")[3]
    }

    if (selectedRadioTime !== "SetTime") {
        // Найти все элементы с классом Arrow и сделать их недоступными
        const arrows = document.querySelectorAll('.yNCj7');
        arrows.forEach(arrow => arrow.classList.add('disabled'));
    } else {
        const arrows = document.querySelectorAll('.yNCj7');
        arrows.forEach(arrow => arrow.classList.remove('disabled'));
    }
    refrechValue()
    $.ajax({
        url: 'main.php',
        method: 'POST',
        data: {
            GTime: GTime
        },
        success: function(response) {
            console.log('GTime saved in session');
        }
    });
}

function PaymentTypeSelect(paymentType) {

    let labels = document.querySelectorAll('[id^="payment-type"]');

    for (let i = 0; i < labels.length; i++) {
        labels[i].style.backgroundColor = "";
        labels[i].style.color = "#000000";
        labels[i].style.fontWeight = "Normal";

    }
    document.getElementById(`payment-type${paymentType}`).style.backgroundColor = "#dcffe0";
    //document.getElementById(`payment-type${paymentType}`).style.color = "#17551E";

    document.getElementById(`payment-type${paymentType}Main`).style.color = "#008c52";
    document.getElementById(`payment-type${paymentType}Main`).style.fontWeight = "Bold";

    document.getElementById(`payment-type${paymentType}Second`).style.color = "#00a68d";


    selectedPaymentType = paymentType;
    document.getElementById("outputPaymentType").textContent = PaymentTypeDictionary[selectedPaymentType];
    refrechValue()
    $.ajax({
        url: 'main.php',
        method: 'POST',
        data: {
            selectedPaymentType: selectedPaymentType,
        },
        success: function(response) {
            console.log('PaymentTypeSelect saved in session');
        }
    });
}

function TariffSelect(tariff) {

    let labels = document.querySelectorAll('[id^="tariff-type"]');

    for (let i = 0; i < labels.length; i++) {
        labels[i].style.backgroundColor = "";
        labels[i].style.color = "#000000";
    }
    document.getElementById(`tariff-type${tariff}`).style.backgroundColor = "#dcffe0";
    document.getElementById(`tariff-type${tariff}`).style.color = "#17551E";

    selectedTariff = tariff;
    document.getElementById("outputTariffType").textContent = tariffDictionary[selectedTariff];
    document.getElementById("outputTariffCost").textContent = tariffCost[selectedTariff] + "₴";
    refrechValue()
    $.ajax({
        url: 'main.php',
        method: 'POST',
        data: { selectedTariff: selectedTariff },
        success: function(response) {
            console.log('TariffSelect saved in session');
        },
        error: function(xhr, status, error) {
            console.error('Error occurred:', error);
        }
    });

}

function TariffTypeShow() {
    document.getElementById("input-start-address").style.display = "block";
    document.getElementById("input-end-address").style.display = "block";
    document.getElementById("input-comment").style.display = "block";
    document.getElementById("input-time").style.display = "block";
    document.getElementById("payment-method").style.display = "block";
    document.getElementById("tariff-typeMain").style.display = "block";
    document.getElementById("order-button").style.display = "block";

    document.getElementById("back-button_tariff").style.display = "none";
    document.getElementById("tariff-typeDelivery").style.display = "none"
    document.getElementById("tariff-typeStandard").style.display = "none";
    document.getElementById("tariff-typeComfort").style.display = "none";
    document.getElementById("tariff-typeMinibus").style.display = "none";
    document.getElementById("tariff-typeBusiness").style.display = "none";

}

function TariffTypeClick() {
    document.getElementById("input-start-address").style.display = "none";
    document.getElementById("input-end-address").style.display = "none";
    document.getElementById("input-comment").style.display = "none";
    document.getElementById("input-time").style.display = "none";
    document.getElementById("payment-method").style.display = "none";
    document.getElementById("tariff-typeMain").style.display = "none";
    document.getElementById("order-button").style.display = "none";


    document.getElementById("back-button_tariff").style.display = "block";
    document.getElementById("tariff-typeDelivery").style.display = "flex"
    document.getElementById("tariff-typeStandard").style.display = "flex";
    document.getElementById("tariff-typeComfort").style.display = "flex";
    document.getElementById("tariff-typeMinibus").style.display = "flex";
    document.getElementById("tariff-typeBusiness").style.display = "flex";




}

function TimeShow() {
    TimeSelect(selectedRadioTime);
    document.getElementById("input-start-address").style.display = "block";
    document.getElementById("input-end-address").style.display = "block";
    document.getElementById("input-comment").style.display = "block";
    document.getElementById("input-time").style.display = "block";
    document.getElementById("payment-method").style.display = "block";
    document.getElementById("tariff-typeMain").style.display = "block";
    document.getElementById("order-button").style.display = "block";

    document.getElementById("back-button_Time").style.display = "none";
    document.getElementById("Timet").style.display = "none";

    //document.getElementById("TimeNow").style.display = "none";
    //document.getElementById("TimeIn15Min").style.display = "none";

}

function TimeClick() {
    document.getElementById("TimeHours").value = GetTimeValue("Now")[1];
    document.getElementById("TimeMin").value = GetTimeValue("Now")[2];

    document.getElementById("input-start-address").style.display = "none";
    document.getElementById("input-end-address").style.display = "none";
    document.getElementById("input-comment").style.display = "none";
    document.getElementById("input-time").style.display = "none";
    document.getElementById("payment-method").style.display = "none";
    document.getElementById("tariff-typeMain").style.display = "none";
    document.getElementById("order-button").style.display = "none";

    document.getElementById("back-button_Time").style.display = "block";
    document.getElementById("Timet").style.display = "block";
    if (selectedRadioTime !== "SetTime") {
        // Найти все элементы с классом Arrow и сделать их недоступными
        const arrows = document.querySelectorAll('.yNCj7');
        arrows.forEach(arrow => arrow.classList.add('disabled'));
    }
    //document.getElementById("TimeNow").style.display = "flex";
    //document.getElementById("TimeIn15Min").style.display = "flex";

}

function PaymentTypeShow() {
    document.getElementById("input-start-address").style.display = "block";
    document.getElementById("input-end-address").style.display = "block";
    document.getElementById("input-comment").style.display = "block";
    document.getElementById("input-time").style.display = "block";
    document.getElementById("payment-method").style.display = "block";
    document.getElementById("tariff-typeMain").style.display = "block";
    document.getElementById("order-button").style.display = "block";


    document.getElementById("back-button_payment").style.display = "none";
    document.getElementById("payment-typeCash").style.display = "none";
    document.getElementById("payment-typeCard").style.display = "none";

}

function PaymentTypeClick() {
    document.getElementById("input-start-address").style.display = "none";
    document.getElementById("input-end-address").style.display = "none";
    document.getElementById("input-comment").style.display = "none";
    document.getElementById("input-time").style.display = "none";
    document.getElementById("payment-method").style.display = "none";
    document.getElementById("tariff-typeMain").style.display = "none";
    document.getElementById("order-button").style.display = "none";


    document.getElementById("back-button_payment").style.display = "block";
    document.getElementById("payment-typeCash").style.display = "flex";
    document.getElementById("payment-typeCard").style.display = "flex";


}

(function () {
    function ModalSignin(element) {
        this.element = element;
        this.blocks = this.element.getElementsByClassName('js-signin-modal-block');
        this.switchers = this.element.getElementsByClassName('js-signin-modal-switcher')[0].getElementsByTagName('a');
        this.triggers = document.getElementsByClassName('js-signin-modal-trigger');
        this.hidePassword = this.element.getElementsByClassName('js-hide-password');
        this.Email = "";
        this.Password = "";
        this.init();
    };

    ModalSignin.prototype.init = function () {
        var self = this;
        //open modal/switch form
        for (var i = 0; i < this.triggers.length; i++) {
            (function (i) {
                self.triggers[i].addEventListener('click', function (event) {
                    if (event.target.hasAttribute('data-signin')) {
                        event.preventDefault();
                        self.showSigninForm(event.target.getAttribute('data-signin'));
                    }
                });
            })(i);
        }

        this.element.addEventListener('click', function (event) {
            if (hasClass(event.target, 'js-signin-modal') || hasClass(event.target, 'js-close')) {
                event.preventDefault();
                removeClass(self.element, 'cd-signin-modal--is-visible');
            }
        });
        document.addEventListener('keydown', function (event) {
            (event.which == '27') && removeClass(self.element, 'cd-signin-modal--is-visible');
        });

        for (var i = 0; i < this.hidePassword.length; i++) {
            (function (i) {
                self.hidePassword[i].addEventListener('click', function (event) {
                    self.togglePassword(self.hidePassword[i]);
                });
            })(i);
        }
    };

    ModalSignin.prototype.togglePassword = function (target) {
        var password = target.previousElementSibling;
        ('password' == password.getAttribute('type')) ? password.setAttribute('type', 'text') : password.setAttribute('type', 'password');
        target.textContent = ('Сховати' == target.textContent) ? 'Показати' : 'Сховати';
        putCursorAtEnd(password);
    }

    ModalSignin.prototype.showSigninForm = function (type) {
        // show modal if not visible
        !hasClass(this.element, 'cd-signin-modal--is-visible') && addClass(this.element, 'cd-signin-modal--is-visible');
        // show selected form
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].getAttribute('data-type') == type ? addClass(this.blocks[i], 'cd-signin-modal__block--is-selected') : removeClass(this.blocks[i], 'cd-signin-modal__block--is-selected');
        }
        //update switcher appearance
        var switcherType = (type == 'signup') ? 'signup' : 'login';
        for (var i = 0; i < this.switchers.length; i++) {
            this.switchers[i].getAttribute('data-type') == switcherType ? addClass(this.switchers[i], 'cd-selected') : removeClass(this.switchers[i], 'cd-selected');
        }
    };

    ModalSignin.prototype.toggleError = function (input, bool) {
        // used to show error messages in the form
        toggleClass(input, 'cd-signin-modal__input--has-error', bool);
        toggleClass(input.nextElementSibling, 'cd-signin-modal__error--is-visible', bool);
    }

    var signinModal = document.getElementsByClassName("js-signin-modal")[0];
    if (signinModal) {
        new ModalSignin(signinModal);

    }


    var mainNav = document.getElementsByClassName('js-main-nav')[0];
    if (mainNav) {
        mainNav.addEventListener('click', function (event) {
            if (hasClass(event.target, 'js-main-nav')) {
                var navList = mainNav.getElementsByTagName('ul')[0];
                toggleClass(navList, 'cd-main-nav__list--is-visible', !hasClass(navList, 'cd-main-nav__list--is-visible'));
            }
        });
    }

    function hasClass(el, className) {
        if (el.classList) return el.classList.contains(className);
        else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }

    function addClass(el, className) {
        var classList = className.split(' ');
        if (el.classList) el.classList.add(classList[0]);
        else if (!hasClass(el, classList[0])) el.className += " " + classList[0];
        if (classList.length > 1) addClass(el, classList.slice(1).join(' '));
    }

    function removeClass(el, className) {
        var classList = className.split(' ');
        if (el.classList) el.classList.remove(classList[0]);
        else if (hasClass(el, classList[0])) {
            var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
        if (classList.length > 1) removeClass(el, classList.slice(1).join(' '));
    }

    function toggleClass(el, className, bool) {
        if (bool) addClass(el, className);
        else removeClass(el, className);
    }

    function putCursorAtEnd(el) {
        if (el.setSelectionRange) {
            var len = el.value.length * 2;
            el.focus();
            el.setSelectionRange(len, len);
        } else {
            el.value = el.value;
        }
    }
    window.showLoginForm = function() {
        var signinModal = document.getElementsByClassName("js-signin-modal")[0];
        if (signinModal) {
            var modalSignin = new ModalSignin(signinModal);
            modalSignin.showSigninForm('login');
        }
    };

})();


let debounceCheckAddress = _.debounce((input, type) => {
    checkAddress(input, type);
}, 300);

function checkAddress(input, typeAddress) {
    const inputValue = input.value.trim();
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (inputValue.length < 3) return; // Wait for at least 3 characters

    const query = `${inputValue}, Одесса`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                const suggestion = document.createElement('div');
                suggestion.classList.add('autocomplete-suggestion');
                suggestion.textContent = item.display_name;
                suggestion.onclick = () => {
                    //alert(item.osm_id);
                    getDetails(item.osm_id, item.osm_type, typeAddress);


                    input.value = item.display_name;

                    suggestionsContainer.innerHTML = ''; // Clear suggestions after selection
                };
                suggestionsContainer.appendChild(suggestion);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

function getDetails(osm_id, osm_type, typeAddress) {
    // Convert OSM type to the required format
    const osmTypeMap = {
        'node': 'N',
        'way': 'W',
        'relation': 'R'
    };

    let streetOsm_id;

    const osmType = osmTypeMap[osm_type];

    fetch(`https://nominatim.openstreetmap.org/details.php?osmtype=${osmType}&osmid=${osm_id}&addressdetails=1&format=json`)
        .then(response => response.json())
        .then(details => {
            //console.log(details);
            HouseNumber = details.addresstags.housenumber;
            //console.log(HouseNumber);

            if (details.address) {
                const highwayAddress = details.address.find(item => item.class === 'highway');
                const streetName = highwayAddress.localname;
                streetOsm_id = highwayAddress.osm_id;
                //console.log('Локальное имя улицы:', streetName,"-",streetOsm_id);
                fetch(`https://nominatim.openstreetmap.org/details.php?osmtype=W&osmid=${streetOsm_id}&format=json`)
                    .then(response => response.json())
                    .then(detailsStreet => {
                        StreetEn = detailsStreet.names['name:en']
                        //console.log(StreetEn);
                        console.log(detailsStreet.geometry.coordinates)
                        if (typeAddress === "Start") {
                            GStartAddress = `${StreetEn}-${HouseNumber}-Odessa-Ukraine-${streetOsm_id}`;
                            console.log(GStartAddress);
                            refrechValue()
                            map.setView([detailsStreet.geometry.coordinates[1], detailsStreet.geometry.coordinates[0]], 16);
                            marker.setLatLng([detailsStreet.geometry.coordinates[1], detailsStreet.geometry.coordinates[0]]);
                            RoutingPoints[0][0] = detailsStreet.geometry.coordinates[1];
                            RoutingPoints[0][1] = detailsStreet.geometry.coordinates[0];
                        } else {
                            GEndAddress = `${StreetEn}-${HouseNumber}-Odessa-Ukraine-${streetOsm_id}`;
                            console.log(GEndAddress);
                            refrechValue()
                            map.setView([detailsStreet.geometry.coordinates[1], detailsStreet.geometry.coordinates[0]], 16);
                            marker.setLatLng([detailsStreet.geometry.coordinates[1], detailsStreet.geometry.coordinates[0]]);
                            RoutingPoints[1][0] = detailsStreet.geometry.coordinates[1];
                            RoutingPoints[1][1] = detailsStreet.geometry.coordinates[0];
                        }
                        let isFull = RoutingPoints.every(row => row.every(cell => cell !== undefined && cell !== null));

                        if (isFull){
                            console.log(RoutingPoints);
                            let control = L.Routing.control({
                            waypoints: [
                              L.latLng(RoutingPoints[0][0], RoutingPoints[0][1]),
                              L.latLng(RoutingPoints[1][0], RoutingPoints[1][1])
                            ],
                            routeWhileDragging: true,
                            showInstructions: false // Убираем маркеры поворотов
                        }).addTo(map);

                            control.on('routesfound', function (e) {
                            let route = e.routes[0];
                            let bounds = L.latLngBounds(route.coordinates);
                            map.fitBounds(bounds, { padding: [50, 50] });
                            var summary = route.summary;
                            let totalTimeInMinutes = Math.round(summary.totalTime / 60); // Переводим время из секунд в минуты
                            console.log('Total distance is ' + summary.totalDistance / 1000 + ' km and total time is ' + totalTimeInMinutes + ' minutes');
                            document.getElementById("info-container").style.display = "block";
                            document.getElementById("distance").innerText = `${summary.totalDistance / 1000} км`;
                            document.getElementById("time").innerText = `${totalTimeInMinutes} минут`;
                        });
                        }

                        return [StreetEn, HouseNumber, streetOsm_id];
                    })


            } else {
                console.log('Локальное имя улицы не найдено.');
            }

        })
        .catch(error => {
            console.error('Ошибка при получении деталей:', error);
        });


}

const map = L.map('map', {
    scrollWheelZoom: false,  // Отключаем масштабирование с помощью колесика мыши
    zoomControl: false,      // Убираем кнопки увеличения/уменьшения масштаба
    dragging: false,         // Отключаем кнопки управления масштабом
    doubleClickZoom: false
}).setView([46.4825, 30.7326], 13);

        // Добавляем слой карты OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'EasyRide'
}).addTo(map);

const marker = L.marker([0, 0]).addTo(map);
