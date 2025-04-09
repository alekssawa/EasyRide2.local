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
        reviewRating = parseInt(this.getAttribute('data-value'));
        const allStars = this.parentElement.querySelectorAll('.star img');
        allStars.forEach((img, index) => {
            img.src = index < reviewRating ? '../img/Star_rating.png' : '../img/Star_Empty_rating.png';
        });
    });
});

// Обработка отправки отзыва
document.querySelectorAll('.submit-review').forEach(button => {
    button.addEventListener('click', function () {
        const parent = this.closest('.feedback-section');
        const reviewText = parent.querySelector('textarea').value;
        const review_trip_id = +this.dataset.id;
        const review_client_id = +this.dataset.clientId; // Преобразуем в целое число
        const review_driver_id = +this.dataset.driverId; // Преобразуем в целое число


        if (reviewText.trim() === '' || reviewRating === 0) {
            alert('Будь ласка, напишіть відгук і виберіть рейтинг.');
            return;
        }

        const reviewData = {
            review_trip_id,
            review_client_id,
            review_driver_id,
            review_text: reviewText,
            review_rating: reviewRating
        };

        console.log(reviewData);

        fetch('../includes/AddReview.inc.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Выводим ответ сервера
            if (data.success) {
                alert('Відгук успішно надіслано!');
                
                const feedbackSection = parent;
                const reviewTitle = parent.previousElementSibling; // <div class="line-with-text">REVIEW</div>
            
                // Плавное исчезновение
                feedbackSection.classList.add('fade-out');
                reviewTitle.classList.add('fade-out');
            
                setTimeout(() => {
                    feedbackSection.remove();  // Удаляем блок
                    reviewTitle.remove();      // Удаляем заголовок REVIEW
                }, 500); // 500ms = время анимации
            
            } else {
                alert('Сталася помилка при відправці відгуку.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Сталася помилка при відправці відгуку.');
        });
    });
});
