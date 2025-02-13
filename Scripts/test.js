let fullTime = "2024"
console.log(fullTime); // Добавлено для отладки
$.ajax({
    url: "../includes/CompeleteOrder.inc.php",
    method: "POST",
    data: { fullTime: fullTime },
    success: function(response) {
        console.log("fullTime сохранено в сессии");
    },
    error: function(xhr, status, error) {
        console.error("Ошибка AJAX-запроса:", error);
    }
});