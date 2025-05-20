import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
// import { useRoute } from "../context/routeContext";
import { useNavigate } from "react-router-dom";
// import "../styles/MyOrder.css";

import { ToastContainer, toast } from "react-toastify";

import MapViewOrder from "../components/Map/MapViewOrder";

import tripIcon from "../assets/img/IconTripHistoryDarker.png";
import starIcon from "../assets/img/Star_rating.png";
// import { console } from "inspector";

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

interface OrderLocation {
  order_id: number;
  driver_id: string;
  driver_latitude: number;
  driver_longitude: number;
  start_latitude: number;
  start_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
}

const formatLocation = (loc: string): string => {
  return loc.replace(/-/g, " ");
};

const MyOrder: React.FC = () => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState<OrderLocation | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const navigate = useNavigate();

  const checkUnauthorized = async (response: Response) => {
    if (response.status === 401) {
      await logout();
      navigate("/");
      return true;
    }
    return false;
  };

  useEffect(() =>{
    // console.log(isButtonDisabled)
  }, [isButtonDisabled, setIsButtonDisabled])

  const enableCompleteRideButton = () => {
    console.log("enableCompleteRideButton1")
    setIsButtonDisabled(false);
    console.log("enableCompleteRideButton2")
  };

  const handleRouteCompleted = useCallback(() => {
    fetchOrders();
    toast.success("Поїздка завершена!");
  }, []);

  useEffect(() => {
    if (!user.authenticated) navigate("/");
  }, [user, navigate]);

  const handleCancel = async (orderId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${orderId}/cancel`,
        {
          method: "PUT",
          credentials: "include", // если используешь cookie
        }
      );

      if (await checkUnauthorized(response)) return;

      if (!response.ok) throw new Error("Не удалось отменить заказ");

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

      if (await checkUnauthorized(response)) return;

      if (!response.ok) throw new Error("Не удалось завершить заказ");

      // toast.success("Поїздка завершена");
      // await fetchOrders();
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
        { method: "GET", credentials: "include" }
      );

      if (await checkUnauthorized(res)) return;

      if (res.status === 404) {
        setOrders([]);
      } else if (!res.ok) {
        throw new Error("Ошибка при получении заказов");
      } else {
        const data: Order[] = await res.json();
        setOrders(data);

        if (data.length > 0) {
          try {
            const response = await fetch(
              `http://localhost:5000/api/order-locations/${data[0].id}`,
              { credentials: "include" }
            );

            if (await checkUnauthorized(response)) return;

            if (!response.ok) {
              throw new Error(`Ошибка: ${response.status}`);
            }

            const locationData = await response.json();
            setLocation(locationData);

            // Используем locationData, а не location
            try {
              const routeResponse = await fetch(
                `http://localhost:5000/api/route`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    order_id: Number(data[0].id),
                    driver: {
                      lat: locationData.driver_latitude,
                      lng: locationData.driver_longitude,
                    },
                    from: {
                      lat: locationData.start_latitude,
                      lng: locationData.start_longitude,
                    },
                    to: {
                      lat: locationData.destination_latitude,
                      lng: locationData.destination_longitude,
                    },
                  }),
                }
              );

              if (await checkUnauthorized(routeResponse)) return;

              if (!routeResponse.ok) {
                throw new Error(`Ошибка: ${routeResponse.status}`);
              }

              const routeData = await routeResponse.json();

              console.log(routeData);
            } catch (err) {
              console.error("Ошибка при получении маршрута:", err);
            }
          } catch (err) {
            console.error("Ошибка при получении локации:", err);
          }
        }
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

  // useEffect(() => {
  //   if (orders.length > 0 && orders[0]?.id && !isNaN(Number(orders[0].id))) {
  //     setOrderId(Number(orders[0].id));
  //   }
  // }, [orders, setOrderId]);

  if (loading) return <p>Loading...</p>;
  if (orders.length === 0)
    return (
      <p className="text-2xl mt-[120px] flex justify-center justify-items-center">
        У вас немає подорожі
      </p>
    );

  return (
    <>
      <div className="w-[500px] h-[500px] border-2 border-green-500 mx-auto mt-[90px]">
        <MapViewOrder
          orderID={Number(orders[0].id)}
          driver={{
            lat: location?.driver_latitude ?? 0,
            lng: location?.driver_longitude ?? 0,
          }}
          from={{
            lat: location?.start_latitude ?? 0,
            lng: location?.start_longitude ?? 0,
          }}
          to={{
            lat: location?.destination_latitude ?? 0,
            lng: location?.destination_longitude ?? 0,
          }}
          onWaitingDriverFinish={enableCompleteRideButton}
          onRouteCompleted={handleRouteCompleted}
        />
      </div>
      <div className="orders-list">
        {orders.map((order) => {
          const formattedDistance =
            typeof order.distance === "number"
              ? order.distance.toFixed(2).replace(".", ",")
              : "0,00";

          return (
            <div
              key={order.id}
              className="bg-white rounded-lg mx-auto  my-2 p-4 max-w-lg cursor-pointer transition-all ease-in-out shadow-md hover:shadow-lg overflow-hidden" //mt-[120px]
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
                    <span className="text-gray-500 text-sm">
                      {order.tariff}
                    </span>
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
                        className="w-full bg-gray-700 font-medium text-white py-3 rounded-lg text-sm hover:bg-gray-600 transition-all"
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
                        className="w-full bg-gray-700 font-medium text-white py-3 rounded-lg text-sm hover:bg-gray-600 transition-all"
                        type="button"
                        onClick={() => handleCancel(order.id)}
                      >
                        Отменить поездку
                      </button>
                    </div>

                    <div className="flex flex-col w-full">
                      <button
                        className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
                          isButtonDisabled
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                        type="button"
                        onClick={() => handleComplete(order.id)}
                        disabled={isButtonDisabled}
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
    </>
  );
};

export default MyOrder;
