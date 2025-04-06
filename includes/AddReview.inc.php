<?php
try {
    require_once "../includes/config_session.inc.php";
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    echo '<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>';
    echo '<script src="../Scripts/script.js" defer></script>';

    $order_status_in_progress = "In progress";

    // Проверка на подключение к базе данных
    if (!isset($pdo)) {
        echo json_encode(['success' => false, 'message' => 'Ошибка подключения к базе данных']);
        exit;
    }

    // Проверка на метод запроса
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Получаем данные из запроса
        $data = json_decode(file_get_contents('php://input'), true);

        // Проверяем, что все необходимые данные присутствуют
        if (isset($data['review_client_id'], $data['review_driver_id'], $data['review_text'], $data['review_rating'])) {
            $review_client_id = $data['review_client_id'];
            $review_driver_id = $data['review_driver_id'];
            $review_text = htmlspecialchars($data['review_text'], ENT_QUOTES, 'UTF-8'); // Экранирование XSS
            $review_rating = (int)$data['review_rating']; // Убедимся, что это число

            // Проверка на корректность данных
            if (!is_int($review_client_id) || !is_int($review_driver_id) || !is_string($review_text) || !is_int($review_rating)) {
                echo json_encode(['success' => false, 'message' => 'Неверный тип данных']);
                exit;
            }

            // Подготовка SQL-запроса для вставки отзыва в базу данных
            $sql = "INSERT INTO reviews (review_client_id, review_driver_id, review_text, review_rating)
                    VALUES (:review_client_id, :review_driver_id, :review_text, :review_rating)";

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':review_client_id', $review_client_id);
            $stmt->bindParam(':review_driver_id', $review_driver_id);
            $stmt->bindParam(':review_text', $review_text);
            $stmt->bindParam(':review_rating', $review_rating);

            try {
                // Выполняем запрос
                $stmt->execute();

                // Возвращаем успешный ответ
                echo json_encode(['success' => true]);
            } catch (PDOException $e) {
                // В случае ошибки
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
        }
    }
} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
}
?>
