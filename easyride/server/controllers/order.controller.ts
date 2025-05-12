import { Request, Response } from "express";
import pool from "../lib/db.js";

export const getOrdersByClientId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clientId } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT 
          orders.order_id AS id,
          drivers.driver_p_i_b AS driver,
          tariffs.tariff_name AS tariff,
          orders.order_order_time AS start_time,
          orders.order_client_start_location AS start_location,
          orders.order_client_destination AS destination,
          payments.payment_type AS payment_type,
          orders.order_order_status AS status,
          orders.order_distance AS distance,
          COALESCE(c.car_model, 'Неизвестно') AS car_model,
          COALESCE(c.car_registration_plate, 'Неизвестно') AS car_registration_plate,
          COALESCE(AVG(reviews_drivers.review_rating), 0) AS average_rating,
          tariffs.tariff_cost_for_basic_2km,
          tariffs.tariff_cost_for_additional_km
        FROM orders
        JOIN tariffs ON orders.order_tariff_id = tariffs.tariff_id
        JOIN drivers ON orders.order_driver_id = drivers.driver_id
        JOIN payments ON orders.order_payment_id = payments.payment_id
        LEFT JOIN cars c ON drivers.driver_car_id = c.car_id
        LEFT JOIN reviews_drivers ON drivers.driver_id = reviews_drivers.review_driver_id
        WHERE orders.order_client_id = $1
          AND orders.order_order_status = 'In progress'
        GROUP BY 
          orders.order_id,
          drivers.driver_p_i_b,
          tariffs.tariff_name,
          orders.order_order_time,
          orders.order_client_start_location,
          orders.order_client_destination,
          payments.payment_type,
          orders.order_order_status,
          c.car_model,
          c.car_registration_plate,
          tariffs.tariff_cost_for_basic_2km,
          tariffs.tariff_cost_for_additional_km
        ORDER BY orders.order_id;
        `,
      [clientId]
    );

    if (result.rows.length === 0) {
      res.status(200).json([]); // просто пустой список
      return;
    } else {
      const formattedOrders = result.rows.map((order) => {
        const average_rating =
          Math.round(Number(order.average_rating) * 100) / 100;
        const basicCost = Number(order.tariff_cost_for_basic_2km);
        const additionalCost = Number(order.tariff_cost_for_additional_km);
        const distance = Number(order.distance);

        let amount = 0;

        if (distance < 2) {
          amount = Math.round(basicCost * 2);
        } else {
          const tempCost = distance - 2;
          amount =
            Math.round((tempCost * additionalCost + basicCost) * 2 * 10) / 10; // округляем до 1 знака после запятой
        }

        // Обработка адреса
        const formatAddress = (fullAddress: string): string => {
          const parts = fullAddress.split("-");
          return parts.slice(0, 2).join("-");
        };

        return {
          id: order.id,
          driver: order.driver || "Заглушка",
          tariff: order.tariff || "Заглушка",
          start_time: order.start_time || "Заглушка",
          start_location: formatAddress(order.start_location),
          destination: formatAddress(order.destination),
          payment_type: order.payment_type || "Заглушка",
          distance,
          average_rating,
          car_model: order.car_model || "Заглушка",
          car_registration_plate: order.car_registration_plate || "Заглушка",
          amount,
        };
      });

      res.status(200).json(formattedOrders);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersByDriverId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { driverId } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT 
          orders.order_id AS id,
          clients.client_p_i_b AS client,
          tariffs.tariff_name AS tariff,
          orders.order_order_time AS start_time,
          orders.order_client_start_location AS start_location,
          orders.order_client_destination AS destination,
          payments.payment_type AS payment_type,
          orders.order_order_status AS status,
          orders.order_distance AS distance,
          COALESCE(c.car_model, 'Неизвестно') AS car_model,
          COALESCE(c.car_registration_plate, 'Неизвестно') AS car_registration_plate,
          tariffs.tariff_cost_for_basic_2km,
          tariffs.tariff_cost_for_additional_km
        FROM orders
        JOIN clients ON orders.order_client_id = clients.client_id
        JOIN tariffs ON orders.order_tariff_id = tariffs.tariff_id
        JOIN drivers ON orders.order_driver_id = drivers.driver_id
        LEFT JOIN cars c ON drivers.driver_car_id = c.car_id
        JOIN payments ON orders.order_payment_id = payments.payment_id
        WHERE orders.order_driver_id = $1
          AND orders.order_order_status = 'In progress'
        GROUP BY 
          orders.order_id,
          clients.client_p_i_b,
          tariffs.tariff_name,
          orders.order_order_time,
          orders.order_client_start_location,
          orders.order_client_destination,
          payments.payment_type,
          orders.order_order_status,
          orders.order_distance,
          c.car_model,
          c.car_registration_plate,
          tariffs.tariff_cost_for_basic_2km,
          tariffs.tariff_cost_for_additional_km
        ORDER BY orders.order_id;

        `,
      [driverId]
    );

    if (result.rows.length === 0) {
      res.status(200).json([]); // просто пустой список
      return;
    } else {
      const formattedOrders = result.rows.map((order) => {
        const average_rating =
          Math.round(Number(order.average_rating) * 100) / 100;
        const basicCost = Number(order.tariff_cost_for_basic_2km);
        const additionalCost = Number(order.tariff_cost_for_additional_km);
        const distance = Number(order.distance);

        let amount = 0;
        
        console.log(order);

        if (distance < 2) {
          amount = Math.round(basicCost * 2);
        } else {
          const tempCost = distance - 2;
          amount =
            Math.round((tempCost * additionalCost + basicCost) * 2 * 10) / 10; // округляем до 1 знака после запятой
        }

        // Обработка адреса
        const formatAddress = (fullAddress: string): string => {
          const parts = fullAddress.split("-");
          return parts.slice(0, 2).join("-");
        };

        return {
          id: order.id,
          client: order.client || "Заглушка",
          tariff: order.tariff || "Заглушка",
          start_time: order.start_time || "Заглушка",
          start_location: formatAddress(order.start_location),
          destination: formatAddress(order.destination),
          payment_type: order.payment_type || "Заглушка",
          distance,
          amount,
        };
      });

      res.status(200).json(formattedOrders);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFreeDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `
      SELECT d.driver_id AS id, t.tariff_name AS tariff
      FROM drivers d
      JOIN cars c ON d.driver_car_id = c.car_id
      JOIN tariffs t ON c.car_tariff_id = t.tariff_id
      WHERE d.driver_id NOT IN (
        SELECT order_driver_id
        FROM orders
        WHERE order_order_status = 'In progress'
      )
      ORDER BY d.driver_id ASC;
      `
    );

    res.status(200).json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const {
    client_id,
    driver_id,
    tariff_id,
    order_time,
    start_location,
    destination,
    order_status,
    distance,
    amount, // сумма платежа
    payment_type // используется только для создания payment
  } = req.body;

  try {
    // Шаг 1: Проверка, чтобы у клиента и водителя не было заказов со статусом "In progress"
    const clientOrderCheck = await pool.query(
      `
      SELECT 1 FROM orders
      WHERE order_client_id = $1 AND order_order_status = 'In progress'
      LIMIT 1;
      `,
      [client_id]
    );

    const driverOrderCheck = await pool.query(
      `
      SELECT 1 FROM orders
      WHERE order_driver_id = $1 AND order_order_status = 'In progress'
      LIMIT 1;
      `,
      [driver_id]
    );

    // Если у клиента есть заказ со статусом 'In progress', возвращаем ошибку
    if (clientOrderCheck.rows.length > 0) {
      res.status(400).json({ message: "У клиента уже есть заказ в процессе." });
    }

    // Если у водителя есть заказ со статусом 'In progress', возвращаем ошибку
    if (driverOrderCheck.rows.length > 0) {
      res.status(400).json({ message: "У водителя уже есть заказ в процессе." });
    }

    // Шаг 2: Создаём запись в таблице payments
    const paymentResult = await pool.query(
      `
      INSERT INTO payments (payment_type, payment_amount, payment_date_time)
      VALUES ($1, $2, NOW())
      RETURNING payment_id;
      `,
      [payment_type, amount]
    );

    const payment_id = paymentResult.rows[0].payment_id;

    // Шаг 3: Создаём заказ, используя созданный payment_id
    const orderResult = await pool.query(
      `
      INSERT INTO orders (
        order_payment_id,
        order_client_id,
        order_driver_id,
        order_tariff_id,
        order_order_time,
        order_client_start_location,
        order_client_destination,
        order_order_status,
        order_distance
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      RETURNING *;
      `,
      [
        payment_id,
        client_id,
        driver_id,
        tariff_id,
        order_time,
        start_location,
        destination,
        order_status,
        distance
      ]
    );

    res.status(201).json({
      message: "Order created",
      order: orderResult.rows[0],
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE orders
      SET order_order_status = 'Canceled'
      WHERE order_id = $1
      RETURNING *;
      `,
      [orderId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order canceled successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};