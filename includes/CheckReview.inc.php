<?php
// Проверка наличия отзыва для этого заказа
$order_id = $order['id'];
$client_id = $_SESSION['user_id'];

// SQL-запрос для проверки наличия отзыва
$sql = "SELECT COUNT(*) FROM reviews_drivers WHERE review_trip_id = :order_id AND review_client_id = :client_id";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':order_id', $order_id);
$stmt->bindParam(':client_id', $client_id);
$stmt->execute();

$review_exists = $stmt->fetchColumn() > 0; // Если 1 или больше - отзыв существует
?>