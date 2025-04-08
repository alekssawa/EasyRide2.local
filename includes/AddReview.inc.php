<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

try {
    // Подключение к базе данных
    require_once "../includes/config_session.inc.php";
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    if (!isset($pdo)) {
        echo json_encode(['success' => false, 'message' => 'Ошибка подключения к базе данных']);
        exit;
    }

    // Проверка метода запроса
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Получаем данные
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['review_client_id'], $data['review_driver_id'], $data['review_text'], $data['review_rating'])) {
            $review_client_id = $data['review_client_id'];
            $review_driver_id = $data['review_driver_id'];
            $review_text = htmlspecialchars($data['review_text'], ENT_QUOTES, 'UTF-8');
            $review_rating = (int)$data['review_rating'];
            
            // Проверка типов данных
            if (!is_int($review_client_id) || !is_int($review_driver_id) || !is_string($review_text) || !is_int($review_rating)) {
                echo json_encode(['success' => false, 'message' => 'Неверный тип данных']);
                exit;
            }
            
            // Вставка отзыва в базу данных
            $sql = "INSERT INTO reviews_drivers (review_client_id, review_driver_id, review_text, review_rating)
                    VALUES (:review_client_id, :review_driver_id, :review_text, :review_rating)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':review_client_id', $review_client_id);
            $stmt->bindParam(':review_driver_id', $review_driver_id);
            $stmt->bindParam(':review_text', $review_text);
            $stmt->bindParam(':review_rating', $review_rating);

            // Выполнение запроса
            $stmt->execute();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Недостаточно данных']);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
