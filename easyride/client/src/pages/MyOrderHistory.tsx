import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

import tripIcon from "../assets/img/IconTripHistoryDarker.png";
import starIcon from "../assets/img/Star_rating.png";

interface Order {
  id: string;
  driver?: string;
  client?: string;
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

interface User {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  picture: string | null;
  googleId: string | null;
  password?: string | null;
  role: string | null;
}

const formatLocation = (loc: string): string => {
  return loc.replace(/-/g, " ");
};

const MyOrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/history/${user.role}/${user.userId}`,
          { credentials: "include" }
        );

        if (res.status === 404) {
          setOrders([]);
        } else if (!res.ok) {
          throw new Error("Ошибка при получении заказов");
        } else {
          const data: Order[] = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Ошибка при получении заказов:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleCancel = (orderId: string) => {
    console.log("Отменить поездку:", orderId);
    // Здесь можно добавить API-запрос для отмены поездки
  };

  const handleComplete = (orderId: string) => {
    console.log("Завершить поездку:", orderId);
    // Здесь можно добавить API-запрос для завершения поездки
  };

  if (!user.authenticated) {
    navigate("/");
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>У вас немає подорожі</p>;

  return (
    <OrdersList
      orders={orders}
      user={user}
      handleCancel={handleCancel}
      handleComplete={handleComplete}
    />
  );
};

const OrdersList = ({
  orders,
  user,
  handleCancel,
  handleComplete,
}: {
  orders: Order[];
  user: User;
  handleCancel: (orderId: string) => void;
  handleComplete: (orderId: string) => void;
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="orders-list mt-24">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const formattedDistance =
          typeof order.distance === "number"
            ? order.distance.toFixed(2).replace(".", ",")
            : "0,00";

        return (
          <div
            key={order.id}
            className="bg-white rounded-lg mx-auto my-2 p-4 max-w-lg cursor-pointer transition-all ease-in-out shadow-md hover:shadow-lg overflow-hidden"
            onClick={() => toggleExpand(order.id)}
          >
            <div className="flex justify-between p-4 rounded-lg font-medium border border-gray-300">
              <div className="flex items-center">
                <img
                  src={tripIcon}
                  alt="Маршрут"
                  className="mr-2"
                  style={{ width: "calc(305px / 10)", height: "calc(881px / 10)" }}
                />
                <div className="flex flex-col items-start text-base">
                  <div className="font-semibold">
                    <span>{formatLocation(order.start_location)}</span>
                  </div>
                  <span className="text-gray-500 text-xs">Початок маршруту</span>
                  <div className="font-semibold pt-2">
                    <span>{formatLocation(order.destination)}</span>
                  </div>
                  <span className="text-gray-500 text-xs">Пункт призначення</span>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4">
                <div className="flex justify-center items-center py-4 text-gray-600 text-sm font-medium w-full relative">
                  <div className="flex-grow border-b border-gray-300 mr-2"></div>
                  <span className="px-2 bg-white">DETAILS</span>
                  <div className="flex-grow border-b border-gray-300 ml-2"></div>
                </div>

                <div className="flex justify-between bg-white p-4 rounded-lg mb-4 h-20 border border-gray-300">
                  <div className="flex flex-col justify-end">
                    {user?.role === "client" ? (
                      <>
                        <span>{order.driver}</span>
                        <span className="flex items-center">
                          Driver
                          <img
                            src={starIcon}
                            alt="rating"
                            className="w-2 h-auto ml-1"
                          />
                          {order.average_rating.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span>{order.client}</span>
                    )}
                  </div>

                  {user?.role === "client" && (
                    <div className="flex flex-col items-end">
                      <span className="font-semibold">{order.car_model}</span>
                      <span className="text-gray-500 text-sm">{order.car_registration_plate}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-5 justify-items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold">Тариф:</span>
                    <span className="text-gray-500 text-sm">{order.tariff}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Дата:</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(order.start_time).toLocaleString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Відстань:</span>
                    <span className="text-gray-500 text-sm">{formattedDistance} км</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 justify-items-center mt-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">Тип оплати:</span>
                    <span className="text-gray-500 text-sm">{order.payment_type}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">Вартість:</span>
                    <span className="text-gray-500 text-sm">
                      {order.amount.toFixed(2).replace(".", ",")} ₴
                    </span>
                  </div>
                </div>

                <div className="flex justify-center items-center py-4 text-gray-600 text-sm font-medium w-full relative mt-4">
                  <div className="flex-grow border-b border-gray-300 mr-2"></div>
                  <span className="px-2 bg-white">CONTROL</span>
                  <div className="flex-grow border-b border-gray-300 ml-2"></div>
                </div>

                {user?.role === "client" ? (
                  <button
                    className="w-full h-[40px] bg-gray-700 text-white py-3 rounded-lg text-[8px] hover:bg-gray-600 transition-all"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(order.id);
                    }}
                  >
                    Скасувати поїздку
                  </button>
                ) : (
                  <div className="flex justify-between">
                    <button
                      className="w-full h-[40px] bg-gray-700 text-white py-3 rounded-lg text-[8px] hover:bg-gray-600 transition-all mr-2"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(order.id);
                      }}
                    >
                      Скасувати поїздку
                    </button>
                    <button
                      className="w-full h-[24px] bg-gray-700 text-white text-[8px] !important rounded-md hover:bg-gray-600 transition-all p-0"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(order.id);
                      }}
                    >
                      Завершити поїздку
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MyOrderHistory;
