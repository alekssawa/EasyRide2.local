<?php
$host = 'localhost';
$dbname= 'easyride';
$dbusername = 'postgres';
$dbpassword = 'root';

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $dbusername, $dbpassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//    if(!isset($_SESSION["user_email"])){
//        echo ("1");
//    } else{
//        echo ($_SESSION["user_email"]);
//    }
    //echo '<script>console.log("norm")</script';

//    $stmt = $pdo->query('SELECT * FROM clients');
//
//    // Получение всех строк результата
//    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
//
//    if ($clients) {
//        echo '<table border="1">';
//        echo '<tr>';
//        // Вывод заголовков таблицы
//        foreach (array_keys($clients[0]) as $column) {
//            echo "<th>$column</th>";
//        }
//        echo '</tr>';
//        // Вывод данных таблицы
//        foreach ($clients as $client) {
//            echo '<tr>';
//            foreach ($client as $value) {
//                echo "<td>$value</td>";
//            }
//            echo '</tr>';
//        }
//        echo '</table>';
//    } else {
//        echo 'Таблица clients пуста.';
//    }


} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
    echo '<script>console.log("fail")</script';
}

//header('Content-Type: application/json'); // Указываем, что ответ будет в формате JSON
// Подключаемся к базе данных

//header('Content-Type: application/json'); // Указываем, что ответ будет в формате JSON

// Подключение к базе данных
// SQL-запрос для получения водителей без активных заказов
$sql = "
    SELECT d.driver_id, t.tariff_name 
    FROM drivers d
    LEFT JOIN orders o ON d.driver_id = o.order_driver_id AND o.order_order_status = 'In progress'
    JOIN cars c ON d.driver_car_id = c.car_id
    JOIN tariffs t ON c.car_tariff_id = t.tariff_id
    WHERE o.order_driver_id IS NULL
";

$stmt = $pdo->prepare($sql);
$stmt->execute();
$drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Количество групп
$numGroups = 4;
$groups = array_fill(0, $numGroups, []);
$groupTariffs = array_fill(0, $numGroups, []);

// Сортируем водителей по тарифам, чтобы равномерно распределить
$tariffGroups = [];
foreach ($drivers as $driver) {
    $tariffGroups[$driver['tariff_name']][] = $driver;
}

// 1. Равномерное распределение
$allDrivers = [];
foreach ($tariffGroups as $tariff => $drivers) {
    shuffle($drivers); // Перемешиваем внутри тарифов
    $allDrivers = array_merge($allDrivers, $drivers);
}

for ($i = 0; $i < count($allDrivers); $i++) {
    $groupIndex = $i % $numGroups; // Циклическое распределение по группам
    $groups[$groupIndex][] = $allDrivers[$i];
    $groupTariffs[$groupIndex][] = $allDrivers[$i]['tariff_name'];
}

// 2. Проверка и исправление повторов
function hasDuplicates($group) {
    $tariffs = array_column($group, 'tariff_name');
    return count($tariffs) !== count(array_unique($tariffs));
}

// 3. Перестановка водителей, если есть дубли тарифов
for ($i = 0; $i < $numGroups; $i++) {
    for ($j = $i + 1; $j < $numGroups; $j++) {
        if (hasDuplicates($groups[$i]) || hasDuplicates($groups[$j])) {
            foreach ($groups[$i] as $indexA => $driverA) {
                foreach ($groups[$j] as $indexB => $driverB) {
                    if ($driverA['tariff_name'] === $driverB['tariff_name']) {
                        continue; // Не меняем местами, если тарифы одинаковые
                    }

                    // Меняем местами
                    $groups[$i][$indexA] = $driverB;
                    $groups[$j][$indexB] = $driverA;

                    // Проверяем, решило ли это проблему
                    if (!hasDuplicates($groups[$i]) && !hasDuplicates($groups[$j])) {
                        break 2; // Если всё стало нормально, выходим из цикла
                    } else {
                        // Если нет, возвращаем всё обратно
                        $groups[$i][$indexA] = $driverA;
                        $groups[$j][$indexB] = $driverB;
                    }
                }
            }
        }
    }
}

// Преобразуем массив в JSON
file_put_contents(__DIR__ . '/../other/drivers.json', json_encode($groups, JSON_PRETTY_PRINT));


?>


