import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

import tripIcon from "../assets/img/IconTripHistoryDarker.png";
import starIcon from "../assets/img/Star_rating.png"; // Заполненная звезда
import EmptyStarIcon from "../assets/img/Star_Empty_rating.png"; // Пустая звезда

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

  if (!user.authenticated) {
    navigate("/");
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>У вас немає подорожі</p>;

  return <OrdersList orders={orders} user={user} />;
};

const OrdersList = ({ orders, user }: { orders: Order[]; user: User }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleStarClick = (orderId: string, star: number) => {
    setRatings((prev) => ({ ...prev, [orderId]: star }));
  };

  const handleReviewChange = (orderId: string, text: string) => {
    setReviews((prev) => ({ ...prev, [orderId]: text }));
  };

  const handleSubmitReview = (orderId: string) => {
    // Here you would typically send the review and rating to your backend
    console.log(`Submitting review for order ${orderId}:`, {
      rating: ratings[orderId],
      review: reviews[orderId],
    });
    // You can add your API call here
  };

  return (
    <div className="orders-list mt-[120px]">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const formattedDistance =
          typeof order.distance === "number"
            ? order.distance.toFixed(1).replace(".", ",")
            : "0,0";
        const currentRating = ratings[order.id] || 0;

        return (
          <div
            key={order.id}
            className="bg-white rounded-lg mx-auto my-2 p-4 max-w-lg cursor-pointer transition-all ease-in-out shadow-md hover:shadow-lg overflow-hidden"
            onClick={() => toggleExpand(order.id)}
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
                          {order.average_rating?.toFixed(1) ?? "-"}
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
                  <div className="flex flex-col justify-start">
                    <span className="font-semibold">Тариф:</span>
                    <span className="text-gray-500 text-sm">
                      {order.tariff}
                    </span>
                  </div>
                  <div className="flex flex-col justify-start">
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
                  <div className="flex flex-col justify-start">
                    <span className="font-semibold">Відстань:</span>
                    <span className="text-gray-500 text-sm">
                      {formattedDistance} км
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5 justify-items-center mt-3">
                  <div className="flex flex-col justify-start">
                    <span className="font-semibold">Тип оплати:</span>
                    <span className="text-gray-500 text-sm">
                      {order.payment_type}
                    </span>
                  </div>
                  <div className="flex flex-col justify-start">
                    <span className="font-semibold">Вартість:</span>
                    <span className="text-gray-500 text-sm">
                      {order.amount.toFixed(2).replace(".", ",")} ₴
                    </span>
                  </div>
                </div>

                {user.role === "client" && (
                  <>
                    <div className="flex justify-center items-center py-4 text-gray-600 text-sm font-medium w-full relative">
                      <div className="flex-grow border-b border-gray-300 mr-2"></div>
                      <span className="px-2 bg-white">REVIEW</span>
                      <div className="flex-grow border-b border-gray-300 ml-2"></div>
                    </div>

                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-roboto"
                      placeholder="Напишіть свій відгук тут..."
                      rows={5}
                      maxLength={300}
                      value={reviews[order.id] || ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        const ta = e.target as HTMLTextAreaElement;
                        ta.style.height = "auto";
                        ta.style.height = ta.scrollHeight + "px";
                        handleReviewChange(order.id, ta.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ overflow: "hidden" }}
                    />

                    {/* Рейтинг звезд */}
                    <div className="flex justify-center items-center my-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <img
                          key={star}
                          src={star <= currentRating ? starIcon : EmptyStarIcon}
                          alt={`star-${star}`}
                          className="w-10 h-10 mx-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStarClick(order.id, star);
                          }}
                        />
                      ))}
                    </div>

                    <button
                      className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitReview(order.id);
                      }}
                    >
                      Надіслати
                    </button>
                  </>
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
