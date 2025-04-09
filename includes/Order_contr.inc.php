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
        SELECT orders.order_id as id, 
               drivers.driver_p_i_b as driver, 
               tariffs.tariff_name as tariff, 
               orders.order_order_time as start_time, 
               orders.order_client_start_location as start_location,
               orders.order_client_destination as destination, 
               orders.order_payment_type as payment_type, 
               orders.order_order_status as status, 
               orders.order_distance AS distance,
               COALESCE(c.car_model, \'Неизвестно\') AS car_model,
               COALESCE(c.car_registration_plate, \'Неизвестно\') AS car_registration_plate,
               COALESCE(AVG(review_rating), 0) AS average_rating,
               tariffs.tariff_cost_for_basic_2km, 
               tariffs.tariff_cost_for_additional_km
        FROM orders
        JOIN tariffs ON orders.order_tariff_id = tariffs.tariff_id
        JOIN drivers ON orders.order_driver_id = drivers.driver_id
        LEFT JOIN cars c ON drivers.driver_car_id = c.car_id
        LEFT JOIN reviews_drivers ON drivers.driver_id = reviews_drivers.review_driver_id
        WHERE order_client_id = :order_client_id
        AND orders.order_order_status = :order_order_status
        GROUP BY orders.order_id, 
                 drivers.driver_p_i_b, 
                 tariffs.tariff_name, 
                 orders.order_order_time, 
                 orders.order_client_start_location, 
                 orders.order_client_destination, 
                 orders.order_payment_type, 
                 orders.order_order_status, 
                 c.car_model, 
                 c.car_registration_plate,
                 tariffs.tariff_cost_for_basic_2km,
                 tariffs.tariff_cost_for_additional_km
        ORDER BY orders.order_id;
    ');

        $stmt->bindParam(":order_client_id", $_SESSION["user_id"]);
        $stmt->bindParam(":order_order_status", $status);
        $status = "In progress";
        $stmt->execute();

        // Получаем первый (и единственный) заказ
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        // Если нужно, можно округлить рейтинг
        if ($order) {
            // Заказ найден
            $order['average_rating'] = round($order['average_rating'], 2);

            // Рассчитываем сумму (amount)
            if ($order['distance'] < 2) {
                // Если расстояние меньше 2 км
                $order['amount'] = round($order['tariff_cost_for_basic_2km'] * 2);
            } else {
                // Если расстояние больше или равно 2 км
                $TempCost = $order['distance'] - 2;
                $order['amount'] = round(($TempCost * $order['tariff_cost_for_additional_km'] + $order['tariff_cost_for_basic_2km']) * 2);
            }
            echo '
            <div class="order">
                <div class="order-header">
                    <div class="route-wrapper">
                        <img src="../img/IconTripHistoryDarker.png" alt="Маршрут" class="route-icon">
                        <div class="route">
                            <div class="start_location">
                                <span>' . htmlspecialchars(implode(', ', array_slice(explode('-', $order['start_location']), 0, 2))) . '</span>
                                <span>Початок маршруту</span>
                            </div>
                            <br>
                            <div class="destination">
                                <span>' . htmlspecialchars(implode(', ', array_slice(explode('-', $order['destination']), 0, 2))) . '</span>
                                <span>Пункт призначення</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-details">
                    <div class="line-with-text">DETAILS</div>
                    <div class="order-details-driver">
                        <div class="profile-driver">
                            <span>' . htmlspecialchars($order['driver']) . '</span>
                            <span>Driver
                                <img src="../img/Star_rating.png" style="width: 10px; height: auto; display: inline-block;" alt="">
                                ' . htmlspecialchars($order['average_rating']) . '
                            </span>
                        </div>
                        <div class="car-driver">
                            <span class="model">' . htmlspecialchars($order['car_model'] ?? 'Неизвестно') . '</span>
                            <span class="plate">' . htmlspecialchars($order['car_registration_plate'] ?? 'Неизвестно') . '</span>
                        </div>
                    </div>
                    <div class="order-info">
                        <div>
                            <div class="line">
                                <span class="first">Тариф:</span>
                                <span class="second">' . htmlspecialchars($order['tariff']) . '</span>
                            </div>
                            <div>
                                <span class="first">Дата:</span>
                                <span class="second">' . date("d.m.y H:i", strtotime($order['start_time'])) . '</span>
                            </div>
                        </div>
                        <div>
                            <div class="line">
                                <span class="first">Відстань:</span>
                                <span class="second">' . number_format($order['distance'], 2, ',', ' ') . ' км</span>
                            </div>
                        </div>
                        <div>
                            <div class="line">
                                <span class="first">Тип оплати:</span>
                                <span class="second">' . htmlspecialchars($order['payment_type']) . '</span>
                            </div>
                            <div>
                                <span class="first">Вартість:</span>
                                <span class="second">' . number_format($order['amount'], 2, ',', ' ') . ' ₴</span>
                            </div>
                        </div>
                    </div>
                    <div class="line-with-text">CONTROL</div>
                    <div class="order-control">
                        <div class="button-container">
                            <form style="width: 100%;"" action="../includes/CanceledOrder.inc.php" method="post">
                                <button class="buttonComplete" type="submit" name="canceled_order">Отменить поездку</button>
                            </form>
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
        SELECT orders.order_id as id, 
               clients.client_p_i_b as client, 
               tariffs.tariff_name as tariff, 
               orders.order_order_time as start_time, 
               orders.order_client_start_location as start_location,
               orders.order_client_destination as destination, 
               orders.order_payment_type as payment_type, 
               orders.order_order_status as status, 
               orders.order_distance AS distance,
               tariffs.tariff_cost_for_basic_2km, 
               tariffs.tariff_cost_for_additional_km
        FROM orders
        JOIN tariffs ON orders.order_tariff_id = tariffs.tariff_id
        JOIN clients ON orders.order_client_id = clients.client_id
        WHERE order_driver_id = :order_driver_id
        AND orders.order_order_status = :order_order_status
        GROUP BY orders.order_id, 
                 clients.client_p_i_b, 
                 tariffs.tariff_name, 
                 orders.order_order_time, 
                 orders.order_client_start_location, 
                 orders.order_client_destination, 
                 orders.order_payment_type, 
                 orders.order_order_status, 
                 tariffs.tariff_cost_for_basic_2km,
                 tariffs.tariff_cost_for_additional_km
        ORDER BY orders.order_id;
    ');

        $stmt->bindParam(":order_driver_id", $_SESSION["user_id"]);
        $stmt->bindParam(":order_order_status", $status);
        $status = "In progress";
        $stmt->execute();

        // Получаем первый (и единственный) заказ
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        // Если нужно, можно округлить рейтинг
        if ($order) {

            // Рассчитываем сумму (amount)
            if ($order['distance'] < 2) {
                // Если расстояние меньше 2 км
                $order['amount'] = round($order['tariff_cost_for_basic_2km'] * 2);
            } else {
                // Если расстояние больше или равно 2 км
                $TempCost = $order['distance'] - 2;
                $order['amount'] = round(($TempCost * $order['tariff_cost_for_additional_km'] + $order['tariff_cost_for_basic_2km']) * 2);
            }
            echo '
            <div class="order">
                <div class="order-header">
                    <div class="route-wrapper">
                        <img src="../img/IconTripHistoryDarker.png" alt="Маршрут" class="route-icon">
                        <div class="route">
                            <div class="start_location">
                                <span>' . htmlspecialchars(implode(', ', array_slice(explode('-', $order['start_location']), 0, 2))) . '</span>
                                <span>Початок маршруту</span>
                            </div>
                            <br>
                            <div class="destination">
                                <span>' . htmlspecialchars(implode(', ', array_slice(explode('-', $order['destination']), 0, 2))) . '</span>
                                <span>Пункт призначення</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-details">
                    <div class="line-with-text">DETAILS</div>
                    <div class="order-details-client">
                        <div class="profile-client">
                            <span>' . htmlspecialchars($order['client']) . '</span>
                            <span>Client
                                <img src="../img/Star_rating.png" style="width: 10px; height: auto; display: inline-block;" alt="">
                                ' . htmlspecialchars($order['average_rating'] ?? '--') . '
                            </span>
                        </div>
                    </div>
                    </div>
                    <div class="order-info">
                        <div>
                            <div class="line">
                                <span class="first">Тариф:</span>
                                <span class="second">' . htmlspecialchars($order['tariff']) . '</span>
                            </div>
                            <div>
                                <span class="first">Дата:</span>
                                <span class="second">' . date("d.m.y H:i", strtotime($order['start_time'])) . '</span>
                            </div>
                        </div>
                        <div>
                            <div class="line">
                                <span class="first">Відстань:</span>
                                <span class="second">' . number_format($order['distance'], 2, ',', ' ') . ' км</span>
                            </div>
                        </div>
                        <div>
                            <div class="line">
                                <span class="first">Тип оплати:</span>
                                <span class="second">' . htmlspecialchars($order['payment_type']) . '</span>
                            </div>
                            <div>
                                <span class="first">Вартість:</span>
                                <span class="second">' . number_format($order['amount'], 2, ',', ' ') . ' ₴</span>
                            </div>
                        </div>
                    </div>
                    <div class="line-with-text">CONTROL</div>
                    <div class="order-control">
                        <div class="button-container">
                            <form style="width: 100%; margin-right: 10px;" action="../includes/CanceledOrder.inc.php" method="post">
                                <button class="buttonComplete" type="submit" name="canceled_order">Отменить поездку</button>
                            </form>
                            <form style="width: 100%;" action="../includes/CompeleteOrder.inc.php" method="post">
                                <button class="buttonComplete buttonComplete-right" type="submit" name="complete_order">Завершить поездку</button>
                            </form>
                        </div>
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
