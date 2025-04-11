<?php
try {
    require_once '../includes/db.inc.php';
    require_once '../includes/login_model.inc.php';
    require_once '../includes/login_contr.inc.php';

    if (!isset($pdo)) {
        echo ("ERROR DATABASE CONNECTION");
    }
    if ($_SESSION["user_status"] == "Client") {
        $stmt = $pdo->prepare('
        SELECT * FROM clients
        WHERE clients.client_id = :client_id
    ');

        $stmt->bindParam(":client_id", $_SESSION["user_id"]);
        $stmt->execute();

        // Получаем первый (и единственный) заказ
        $client = $stmt->fetch(PDO::FETCH_ASSOC);

        // Если нужно, можно округлить рейтинг
        if ($client) {
            // Заказ найден
            echo '
            <div class="profile">
                <div class="profile-details">
                    <div class="profile-details-client">
                        <div class="profile-client">
                            <span>' . htmlspecialchars($client['client_p_i_b']) . '</span>
                            <span>' . htmlspecialchars($client['client_phone_number']) . '</span>
                            <span>' . htmlspecialchars($client['client_email']) . '</span>
                            <span>Client</span>
                        </div>
                    </div>
                </div>
            </div>';
        } else {
            // Заказ не найден
            echo '<p>У вас немає подорожі</p>';
        }
    } elseif ($_SESSION["user_status"] == "Driver") {
        $stmt = $pdo->prepare('
            SELECT 
                drivers.*, 
                COALESCE(AVG(reviews_drivers.review_rating), 0) AS average_rating,
                COALESCE(c.car_model, \'Неизвестно\') AS car_model,
                COALESCE(c.car_registration_plate, \'Неизвестно\') AS car_registration_plate,
                COALESCE(c.car_model_year, \'Неизвестно\') AS car_model_year,
                COALESCE(tariffs.tariff_name, \'Неизвестно\') AS tariff_name
            FROM drivers
            LEFT JOIN reviews_drivers ON drivers.driver_id = reviews_drivers.review_driver_id
            LEFT JOIN cars c ON drivers.driver_car_id = c.car_id
            LEFT JOIN tariffs ON c.car_tariff_id = tariffs.tariff_id
            WHERE drivers.driver_id = :driver_id
            GROUP BY 
                drivers.driver_id, 
                c.car_model, 
                c.car_registration_plate, 
                c.car_model_year,
                tariffs.tariff_name
        ');
    

        $stmt->bindParam(":driver_id", $_SESSION["user_id"]);
        $stmt->execute();

        // Получаем первый (и единственный) заказ
        $driver = $stmt->fetch(PDO::FETCH_ASSOC);

        // Если нужно, можно округлить рейтинг
        if ($driver) {
            $driver['average_rating'] = round($driver['average_rating'], 2);

            echo '
            <div class="profile">
                <div class="profile-details">
                    <div class="profile-details-driver">
                        <div class="profile-driver">
                            <span>' . htmlspecialchars($driver['driver_p_i_b']) . '</span>
                            <span>Driver
                                <img src="../img/Star_rating.png" style="width: 10px; height: auto; display: inline-block;" alt="">
                                ' . htmlspecialchars($driver['average_rating'] ?? '--') . '
                            </span>
                        </div>
                    
                    </div>
                    <div class="line-with-text">DETAILS</div>
                    <div class="car-driver">
                        <span class="model">' . htmlspecialchars($driver['car_model']?? 'Неизвестно') . '</span>
                        <span class="plate">' . htmlspecialchars($driver['car_registration_plate'] ?? 'Неизвестно') . '</span>
                        <span class="plate">' . htmlspecialchars($driver['car_model_year'] ?? 'Неизвестно') . '</span>
                        <span class="plate">' . htmlspecialchars($driver['tariff_name'] ?? 'Неизвестно') . '</span>
                    </div>
                </div>
            </div>';
        } else {
            // Заказ не найден
            echo '<p>У вас немає подорожі</p>';
        }
    }
} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
}
