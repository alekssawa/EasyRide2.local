<?php
try {
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }
    $stmt = $pdo->prepare('SELECT AVG(review_rating) AS average_rating FROM reviews_drivers WHERE review_driver_id = :review_driver_id;');

    $stmt->bindParam(":review_driver_id", $_SESSION["user_id"]);
    $stmt->execute();

// Получение результата
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

// Проверка, что результат не пустой и содержит ключ average_rating
    if ($result && isset($result['average_rating'])) {$average_rating = $result['average_rating'];}

    if ($average_rating !== null) {
        echo (round($average_rating, 2));}
    } catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());

}
?>