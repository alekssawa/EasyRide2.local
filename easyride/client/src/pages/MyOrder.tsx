import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
// import "../styles/MyOrder.css";

import { ToastContainer, toast } from "react-toastify";

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

const formatLocation = (loc: string): string => {
  // Заменяем все дефисы на пробелы
  return loc.replace(/-/g, " ");
};

const MyOrder: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  if (!user.authenticated) navigate("/");

  const handleCancel = async (orderId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${orderId}/cancel`,
        {
          method: "PUT",
          credentials: "include", // если используешь cookie
        }
      );

      if (!response.ok) throw new Error("Не удалось отменить заказ");

      // Можно обновить список заказов или показать сообщение
      console.log("Поїздку скасовано", { orderId });
      toast.success("Поїздку скасовано");
      await fetchOrders(); // <-- Обновляем заказы после отмены
    } catch (error) {
      console.error("Ошибка при отмене заказа:", error);
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${orderId}/complete`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Не удалось завершить заказ");

      // console.log("Поїздка завершена");
      toast.success("Поїздка завершена");
      await fetchOrders();
    } catch (error) {
      console.error("Ошибка при завершении заказа:", error);
      toast.error("Помилка при завершенні замовлення");
    }
  };

  const fetchOrders = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/order/${user.role}/${user.userId}`,
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
  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (orders.length === 0)
    return (
      <p className="text-2xl mt-[120px] flex justify-center justify-items-center">
        У вас немає подорожі
      </p>
    );

  {
    /* FIXME: Сделать растояние и цену в отдельном боредере сверху */
  }
  return (
    <div className="orders-list">
      {orders.map((order) => {
        const formattedDistance =
          typeof order.distance === "number"
            ? order.distance.toFixed(2).replace(".", ",")
            : "0,00";

        return (
          <div
            key={order.id}
            className="bg-white rounded-lg mx-auto mt-[120px] my-2 p-4 max-w-lg cursor-pointer transition-all ease-in-out shadow-md hover:shadow-lg overflow-hidden"
          >
            <div className="flex items-start justify-between p-4 rounded-lg font-medium border border-gray-300">
              <div className="flex items-center">
                <img
                  src={tripIcon}
                  alt="Маршрут"
                  className="mr-2"
                  style={{
                    width: "calc(305px / 9)",
                    height: "calc(881px / 9)",
                  }}
                />
                <div className="flex flex-col items-start text-base space-y-2">
                  <div className="font-semibold">
                    <span>{formatLocation(order.start_location)}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    Початок маршруту
                  </span>
                  <div className="font-semibold pt-2">
                    <span>{formatLocation(order.destination)}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    Пункт призначення
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-0">
                  <div className="flex flex-col justify-center items-center text-sm font-semibold text-gray-700 mt-1 mb-0">
                    <span className="text-gray-500 text-xs">Відстань</span>
                    <span className="text-base">{formattedDistance} км</span>
                  </div>

                  <div className="flex flex-col justify-center items-center text-sm font-semibold text-gray-700 mt-6">
                    <span className="text-gray-500 text-xs">Вартість</span>
                    <div className="flex flex-col justify-center border rounded-full bg-green-50 px-2 py-0.5 border-gray-200 text-xl font-semibold text-green-700 text-center">
                      <span>{order.amount.toFixed(0).replace(".", ",")}₴</span>
                    </div>
                  </div>
                </div>
            </div>

            <div>
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
                    <span className="text-gray-500 text-sm">
                      {order.car_registration_plate}
                    </span>
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
                  <span className="font-semibold">Тип оплати:</span>
                  <span className="text-gray-500 text-sm">
                    {order.payment_type}
                  </span>
                </div>
              </div>

              <div className="flex justify-center items-center py-4 text-gray-600 text-sm font-medium w-full relative">
                <div className="flex-grow border-b border-gray-300 mr-2"></div>
                <span className="px-2 bg-white">CONTROL</span>
                <div className="flex-grow border-b border-gray-300 ml-2"></div>
              </div>

              {user?.role === "client" ? (
                <div className="flex justify-between">
                  <div className="flex flex-col w-full">
                    <button
                      className="w-full bg-gray-700 text-white py-3 rounded-lg text-sm hover:bg-gray-600 transition-all"
                      type="button"
                      onClick={() => handleCancel(order.id)}
                    >
                      Отменить поездку
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <div className="flex flex-col w-full mr-2">
                    <button
                      className="w-full bg-gray-700 text-white py-3 rounded-lg text-sm hover:bg-gray-600 transition-all"
                      type="button"
                      onClick={() => handleCancel(order.id)}
                    >
                      Отменить поездку
                    </button>
                  </div>

                  {/* TODO: Сделать логику завершение поездки, payment type перенести в таблицу payments */}
                  <div className="flex flex-col w-full">
                    <button
                      className="w-full bg-gray-700 text-white py-3 rounded-lg text-sm hover:bg-gray-600 transition-all"
                      type="button"
                      onClick={() => handleComplete(order.id)}
                    >
                      Завершить поездку
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <ToastContainer
        position="bottom-center"
        pauseOnHover={false}
        limit={2}
        autoClose={1500}
      />
    </div>
  );
};

export default MyOrder;
