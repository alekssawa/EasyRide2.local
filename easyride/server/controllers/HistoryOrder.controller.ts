import { Request, Response } from "express";
import pool from "../lib/db.js";

export const getTripHistoryByClientId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clientId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        trip_id AS id,
        drivers.driver_p_i_b AS driver,
        tariffs.tariff_name AS tariff,
        payments.payment_amount AS amount,
        trip_payment_type AS payment_type,
        trip_start_time AS start_time,
        trip_end_time AS end_time,
        trip_client_start_location AS start_location,
        trip_client_destination AS destination,
        COALESCE(AVG(reviews_drivers.review_rating), 0) AS average_rating
      FROM triphistory
      JOIN tariffs ON triphistory.trip_tariff_id = tariffs.tariff_id
      JOIN drivers ON triphistory.trip_driver_id = drivers.driver_id
      JOIN payments ON triphistory.trip_payment_id = payments.payment_id
      LEFT JOIN reviews_drivers ON drivers.driver_id = reviews_drivers.review_driver_id
      WHERE trip_client_id = $1
      GROUP BY trip_id, drivers.driver_p_i_b, tariffs.tariff_name, payments.payment_amount, trip_payment_type, trip_start_time, trip_end_time, trip_client_start_location, trip_client_destination
      ORDER BY trip_id DESC;
      `,
      [clientId]
    );

    if (result.rows.length === 0) {
      res.status(200).json([]);
      return;
    }

    const formatAddress = (fullAddress: string): string => {
      const parts = fullAddress.split('-');
      return parts.slice(0, 2).join('-');
    };

    const formattedTrips = result.rows.map((trip) => ({
      id: trip.id,
      driver: trip.driver || 'Заглушка',
      tariff: trip.tariff || 'Заглушка',
      amount: Number(trip.amount),
      payment_type: trip.payment_type || 'Заглушка',
      start_time: trip.start_time || 'Заглушка',
      end_time: trip.end_time || 'Заглушка',
      start_location: trip.start_location ? formatAddress(trip.start_location) : 'Неизвестно',
      destination: trip.destination ? formatAddress(trip.destination) : 'Неизвестно',
      average_rating: Number(trip.average_rating),
    }));

    res.status(200).json(formattedTrips);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getTripHistoryByDriverId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { driverId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        trip_id AS id,
        clients.client_p_i_b AS client,
        tariffs.tariff_name AS tariff,
        payments.payment_amount AS amount,
        trip_payment_type AS payment_type,
        trip_start_time AS start_time,
        trip_end_time AS end_time,
        trip_client_start_location AS start_location,
        trip_client_destination AS destination
      FROM triphistory
      JOIN tariffs ON triphistory.trip_tariff_id = tariffs.tariff_id
      JOIN clients ON triphistory.trip_client_id = clients.client_id
      JOIN payments ON triphistory.trip_payment_id = payments.payment_id
      WHERE trip_driver_id = $1
      ORDER BY trip_id DESC;
      `,
      [driverId]
    );

    if (result.rows.length === 0) {
      res.status(200).json([]);
      return;
    }

    const formatAddress = (fullAddress: string): string => {
      const parts = fullAddress.split("-");
      return parts.slice(0, 2).join("-");
    };

    const formattedTrips = result.rows.map((trip) => ({
      id: trip.id,
      client: trip.client || "Заглушка",
      tariff: trip.tariff || "Заглушка",
      amount: Number(trip.amount),
      payment_type: trip.payment_type || "Заглушка",
      start_time: trip.start_time || "Заглушка",
      end_time: trip.end_time || "Заглушка",
      start_location: formatAddress(trip.start_location),
      destination: formatAddress(trip.destination),
    }));

    res.status(200).json(formattedTrips);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
