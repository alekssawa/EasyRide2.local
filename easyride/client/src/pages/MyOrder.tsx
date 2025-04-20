import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import "../styles/MyOrder.css";

import tripIcon from "../assets/img/IconTripHistoryDarker.png";
import starIcon from "../assets/img/Star_rating.png";

interface Order {
  id: string;
  driver: string;
  tariff: string;
  start_time: string;
  start_location: string;
  destination: string;
  payment_type: string;
  distance: number;
  average_rating: number;
  car_model: string;
  car_registration_plate: string;
  amount: number;
}

const formatLocation = (loc: string): string => {
  // Заменяем все дефисы на пробелы
  return loc.replace(/-/g, " ");
};

const MyOrder: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/order/${user.userId}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          console.error("Orders not found");
          setOrders([]);
        } else {
          const data: Order[] = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>У вас немає подорожі</p>;

  return (
    <div className="orders-list">
      {orders.map((order) => {
        // Форматируем расстояние
        const formattedDistance =
          typeof order.distance === "number"
            ? order.distance.toFixed(2).replace(".", ",")
            : "0,00";

        return (
          <div key={order.id} className="order">
            <div className="order-header">
              <div className="route-wrapper">
                <img src={tripIcon} alt="Маршрут" className="route-icon" />
                <div className="route">
                  <div className="start_location">
                    <span>{formatLocation(order.start_location)}</span>
                    <span>Початок маршруту</span>
                  </div>
                  <br />
                  <div className="destination">
                    <span>{formatLocation(order.destination)}</span>
                    <span>Пункт призначення</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-details">
              <div className="line-with-text">DETAILS</div>
              <div className="order-details-driver">
                <div className="profile-driver">
                  <span>{order.driver}</span>
                  <span>
                    Driver{" "}
                    <img
                      src={starIcon}
                      alt="rating"
                      style={{
                        width: 8,
                        height: "auto",
                        display: "inline-block",
                        marginLeft: 4,
                      }}
                    />
                    {order.average_rating.toFixed(1)}
                  </span>
                </div>
                <div className="car-driver">
                  <span className="model">{order.car_model}</span>
                  <span className="plate">{order.car_registration_plate}</span>
                </div>
              </div>

              <div className="order-info">
                <div className="line">
                  <span className="first">Тариф:</span>
                  <span className="second">{order.tariff}</span>
                </div>
                <div className="line">
                  <span className="first">Дата:</span>
                  <span className="second">
                    {new Date(order.start_time).toLocaleString("uk-UA", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="line">
                  <span className="first">Відстань:</span>
                  <span className="second">{formattedDistance} км</span>
                </div>
                <div className="line">
                  <span className="first">Тип оплати:</span>
                  <span className="second">{order.payment_type}</span>
                </div>
                <div className="line">
                  <span className="first">Вартість:</span>
                  <span className="second">
                    {order.amount.toFixed(2).replace(".", ",")} ₴
                  </span>
                </div>
              </div>

              <div className="line-with-text">CONTROL</div>
              <div className="order-control">
                <div className="button-container">
                  <button className="buttonComplete" type="button">
                    Отменить поездку
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyOrder;
