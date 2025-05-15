import { Request, Response } from "express";
import pool from "../lib/db.js";

export const getOrderLocationById = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM order_locations WHERE order_id = $1`,
      [order_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Order location not found" });
      return
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching order location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// controllers/orderLocation.controller.ts

export const createOrderLocation = async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      driver_id,
      driver_latitude,
      driver_longitude,
      start_latitude,
      start_longitude,
      destination_latitude,
      destination_longitude,
    } = req.body;

    // Проверка на null/undefined
    if (
      order_id == null ||
      driver_id == null ||
      driver_latitude == null ||
      driver_longitude == null ||
      start_latitude == null ||
      start_longitude == null ||
      destination_latitude == null ||
      destination_longitude == null
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return 
    }

    await pool.query(
      `
      INSERT INTO order_locations (
        order_id, driver_id,
        driver_latitude, driver_longitude,
        start_latitude, start_longitude,
        destination_latitude, destination_longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        order_id,
        driver_id,
        driver_latitude,
        driver_longitude,
        start_latitude,
        start_longitude,
        destination_latitude,
        destination_longitude,
      ]
    );

    res.status(201).json({ message: "Order location created" });
  } catch (error) {
    console.error("Error creating order location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteOrderLocationById = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      `DELETE FROM order_locations WHERE order_id = $1 RETURNING *`,
      [order_id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Order location not found" });
      return 
    }

    res.json({ message: "Order location deleted", deleted: result.rows[0] });
  } catch (error) {
    console.error("Error deleting order location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};