function toggleDetails(orderElement) {
    const details = orderElement.querySelector('.order-details');
    const isOpen = details.style.display === "block";

    // Проверяем, был ли клик по кнопке или полю отзыва
    if (event.target.closest('.feedback-section')) {
        return; // Если клик был внутри блока с отзывом, не сворачиваем заказ
    }

    document.querySelectorAll('.order-details').forEach(el => el.style.display = "none");
    document.querySelectorAll('.order').forEach(el => el.classList.remove('expanded'));

    if (!isOpen) {
        details.style.display = "block";
        orderElement.classList.add('expanded');
    }
}

const maxChars = 500; // Максимальное количество символов
let reviewRating = 0; // Рейтинг

document.querySelectorAll('.feedback-section textarea').forEach(textarea => {
    textarea.addEventListener('input', function () {
        // Сбрасываем высоту для корректного вычисления
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';

        // Получаем количество символов в textarea
        const charCount = this.value.length;

        // Получаем элемент для предупреждения
        const charLimitWarning = document.getElementById('char-limit-warning');

        // Показываем предупреждение, если количество символов превышает максимальное
        if (charCount >= maxChars) {
            this.value = this.value.substring(0, maxChars); // Ограничиваем количество символов
            charLimitWarning.textContent = `Максимум ${maxChars} символів.`;
            charLimitWarning.style.display = 'block';
        } else {
            charLimitWarning.textContent = ''; // Скрываем предупреждение
            charLimitWarning.style.display = 'none';
        }
    });
});

// Обработка кликов на звезды
document.querySelectorAll('.rating .star').forEach(star => {
    star.addEventListener('click', function () {
        const ratingValue = parseInt(this.getAttribute('data-value'));

        // Обновляем рейтинг
        reviewRating = ratingValue;

        // Убираем все звезды (пустые)
        document.querySelectorAll('.rating .star img').forEach(img => {
            img.src = '../img/Star_Empty_rating.png';  // Показать пустые звезды
        });

        // Добавляем заполненные звезды до выбранного значения
        document.querySelectorAll('.rating .star').forEach((star, index) => {
            if (index < ratingValue) {
                star.querySelector('img').src = '../img/Star_rating.png';  // Заполненная звезда
            }
        });
    });
});

// Обработка отправки отзыва
document.getElementById('submit-review').addEventListener('click', function () {
    const reviewText = document.getElementById('feedback').value;

    if (reviewText.trim() === '' || reviewRating === 0) {
        alert('Будь ласка, напишіть відгук і виберіть рейтинг.');
        return;
    }

    const reviewData = {
        review_client_id: 1, // Замените на реальный ID клиента
        review_driver_id: 1, // Замените на реальный ID водителя
        review_text: reviewText,
        review_rating: reviewRating
    };

    fetch('your_api_endpoint_here', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Відгук успішно надіслано!');
            // Очистить форму
            document.getElementById('feedback').value = '';
            document.querySelectorAll('.rating .star img').forEach(img => {
                img.src = '../img/Star_Empty_rating.png';  // Сбросить все звезды на пустые
            });
        } else {
            alert('Сталася помилка при відправці відгуку.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Сталася помилка при відправці відгуку.');
    });
});
